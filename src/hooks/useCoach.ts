/* eslint-disable @typescript-eslint/no-explicit-any */
import { useAppDispatch, useAppSelector } from "./reduxHooks";
import { updateCoachField } from "@/redux/features/coach/coachSlice";
import { useUpdateCoachProfileMutation } from "@/redux/features/cv/cvApi";

export const useCoach = () => {
  const dispatch = useAppDispatch();
  const coachData = useAppSelector((state) => state.coach);
  const [updateCoachProfile] = useUpdateCoachProfileMutation();

  const handleUpdate = async (field: string, value: any) => {
    // Optimistic update in Redux
    dispatch(updateCoachField({ field, value }));

    try {
      // API call
      await updateCoachProfile({ id: "current-coach", data: { [field]: value } }).unwrap();
    } catch (error) {
      console.error(error);
    }
  };

  return {
    coachData,
    handleUpdate,
  };
};
