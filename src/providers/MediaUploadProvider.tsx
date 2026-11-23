"use client";
import React, {
  createContext,
  useContext,
  useState,
  useRef,
  useCallback,
  useEffect,
  ReactNode,
} from "react";
import { BASE_URL } from "@/constants/global.constant";
import { getToken } from "@/helpers/SessionHelper";
import { SuccessToast, ErrorToast, WarningToast } from "@/helpers/ValidationHelper";
import { useAppDispatch } from "@/hooks/reduxHooks";
import { playerApi } from "@/redux/features/player/playerApi";
import { apiSlice } from "@/redux/features/api/apiSlice";
import TagTypes from "@/constants/tagType.constant";
import {
  UploadTask,
  UploadStartPayload,
  MediaUploadProgressWidget,
} from "@/components/user-wise-dashboard/player-dashboard/images-videos";

interface MediaUploadContextType {
  activeUploadTask: UploadTask | null;
  startUpload: (payload: UploadStartPayload) => void;
  cancelUpload: () => void;
  dismissUpload: () => void;
}

const MediaUploadContext = createContext<MediaUploadContextType | undefined>(undefined);

export const MediaUploadProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activeUploadTask, setActiveUploadTask] = useState<UploadTask | null>(null);
  const xhrRef = useRef<XMLHttpRequest | null>(null);
  const dispatch = useAppDispatch();

  // Closing or reloading the tab aborts the upload — warn the user while it's running.
  const isUploadRunning = activeUploadTask?.status === "uploading";
  useEffect(() => {
    if (!isUploadRunning) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isUploadRunning]);

  const cancelUpload = useCallback(() => {
    if (xhrRef.current) {
      xhrRef.current.abort();
      xhrRef.current = null;
    }
    setActiveUploadTask(null);
    WarningToast("Upload cancelled");
  }, []);

  const dismissUpload = useCallback(() => {
    setActiveUploadTask(null);
  }, []);

  const startUpload = useCallback(
    (payload: UploadStartPayload) => {
      if (
        activeUploadTask &&
        (activeUploadTask.status === "uploading" ||
          activeUploadTask.status === "processing")
      ) {
        WarningToast("An upload is already in progress. Please wait for it to complete.");
        return;
      }

      setActiveUploadTask({
        title: payload.title,
        fileName: payload.fileName,
        type: payload.type,
        progress: 0,
        status: "uploading",
        thumbnailPreview: payload.thumbnailPreview,
      });

      const xhr = new XMLHttpRequest();
      xhrRef.current = xhr;
      const token = getToken();

      const endpoint = payload.endpoint || "/media/upload";
      xhr.open("POST", `${BASE_URL}${endpoint}`);

      if (token) {
        xhr.setRequestHeader(
          "Authorization",
          token.startsWith("Bearer ") ? token : `Bearer ${token}`
        );
      }

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 100);
          setActiveUploadTask((prev) => {
            if (!prev) return null;
            return {
              ...prev,
              progress: percent,
              status: percent >= 100 ? "processing" : "uploading",
            };
          });
        }
      };

      xhr.onload = () => {
        xhrRef.current = null;
        if (xhr.status >= 200 && xhr.status < 300) {
          setActiveUploadTask((prev) => {
            if (!prev) return null;
            return {
              ...prev,
              progress: 100,
              status: "success",
            };
          });

          let successMsg =
            payload.type === "video"
              ? "Video uploaded successfully"
              : "Image uploaded successfully";
          try {
            const resJson = JSON.parse(xhr.responseText);
            if (resJson.message) successMsg = resJson.message;
          } catch {
            // Keep default
          }

          SuccessToast(successMsg);

          // Invalidate cache so media lists update across the dashboard
          if (payload.tagsToInvalidate && payload.tagsToInvalidate.length > 0) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            dispatch(apiSlice.util.invalidateTags(payload.tagsToInvalidate as any));
          } else {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            dispatch(apiSlice.util.invalidateTags([TagTypes.MEDIA, TagTypes.PLAYERS] as any));
          }

          // Auto dismiss completed widget after 3.5 seconds
          setTimeout(() => {
            setActiveUploadTask((curr) => (curr?.status === "success" ? null : curr));
          }, 3500);
        } else {
          let errorMsg = "Upload failed";
          try {
            const errJson = JSON.parse(xhr.responseText);
            errorMsg = errJson.message || errorMsg;
          } catch {
            errorMsg = `Server error (${xhr.status})`;
          }

          setActiveUploadTask((prev) => {
            if (!prev) return null;
            return {
              ...prev,
              status: "error",
              errorMessage: errorMsg,
            };
          });
          ErrorToast(errorMsg);
        }
      };

      xhr.onerror = () => {
        xhrRef.current = null;
        setActiveUploadTask((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            status: "error",
            errorMessage: "Network error occurred during upload",
          };
        });
        ErrorToast("Network connection error during upload");
      };

      xhr.onabort = () => {
        xhrRef.current = null;
        setActiveUploadTask(null);
      };

      xhr.send(payload.formData);
    },
    [activeUploadTask, dispatch]
  );

  return (
    <MediaUploadContext.Provider
      value={{
        activeUploadTask,
        startUpload,
        cancelUpload,
        dismissUpload,
      }}
    >
      {children}
      {activeUploadTask && (
        // Floating, so the progress stays visible on every page and scroll position.
        <div className="fixed bottom-4 right-4 left-4 z-50 sm:left-auto sm:w-110">
          <MediaUploadProgressWidget
            task={activeUploadTask}
            onCancel={cancelUpload}
            onDismiss={dismissUpload}
          />
        </div>
      )}
    </MediaUploadContext.Provider>
  );
};

export const useMediaUpload = () => {
  const context = useContext(MediaUploadContext);
  if (!context) {
    return {
      activeUploadTask: null,
      startUpload: async () => {},
      cancelUpload: () => {},
      dismissUpload: () => {},
    };
  }
  return context;
};
