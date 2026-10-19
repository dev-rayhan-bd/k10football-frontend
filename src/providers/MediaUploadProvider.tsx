"use client";
import React, {
  createContext,
  useContext,
  useState,
  useRef,
  useCallback,
  ReactNode,
} from "react";
import { usePathname } from "next/navigation";
import { BASE_URL } from "@/constants/global.constant";
import { getToken } from "@/helpers/SessionHelper";
import { SuccessToast, ErrorToast, WarningToast } from "@/helpers/ValidationHelper";
import { useAppDispatch } from "@/hooks/reduxHooks";
import { playerApi } from "@/redux/features/player/playerApi";
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

      xhr.open("POST", `${BASE_URL}/players/me/media`);

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

          SuccessToast(
            payload.type === "video"
              ? "Video uploaded successfully"
              : "Image uploaded successfully"
          );

          // Invalidate player cache so media list updates anywhere in the app
          dispatch(playerApi.util.invalidateTags([TagTypes.PLAYERS]));

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
    </MediaUploadContext.Provider>
  );
};

export const GlobalUploadWidget: React.FC = () => {
  const { activeUploadTask, cancelUpload, dismissUpload } = useMediaUpload();
  const pathname = usePathname();

  // On images-videos page, ImagesVideos component renders it right above header cards
  if (!activeUploadTask || pathname === "/dashboard/player/images-videos") {
    return null;
  }

  return (
    <div className="mb-6 animate-in fade-in slide-in-from-top-4 duration-300">
      <MediaUploadProgressWidget
        task={activeUploadTask}
        onCancel={cancelUpload}
        onDismiss={dismissUpload}
      />
    </div>
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
