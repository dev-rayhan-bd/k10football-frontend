/* eslint-disable @typescript-eslint/no-explicit-any */
import { useAppDispatch, useAppSelector } from "./reduxHooks";
import {
  updatePlayerField,
  setSelectedPlayerId,
  validatePlayerCv,
  addPlayer,
  PlayerData
} from "@/redux/features/player/playerSlice";
import { toast } from "sonner";

export const usePlayer = () => {
  const dispatch = useAppDispatch();
  const players = useAppSelector((state) => state.player.players);
  const selectedPlayerId = useAppSelector((state) => state.player.selectedPlayerId);
  const playerData = players.find((p) => p.id === selectedPlayerId) || players[0];

  const handleUpdate = async (field: string, value: any) => {
    dispatch(updatePlayerField({ field, value }));
  };

  const selectPlayer = (id: number) => {
    dispatch(setSelectedPlayerId(id));
  };

  const validatePlayer = (id: number) => {
    dispatch(validatePlayerCv(id));
    toast.success("Player CV successfully validated");
  };

  const handleCreatePlayer = (data: Partial<PlayerData>) => {
    dispatch(addPlayer(data));
    toast.success("Player added successfully");
  };

  return {
    playerData,
    players,
    selectedPlayerId,
    handleUpdate,
    selectPlayer,
    validatePlayer,
    handleCreatePlayer,
  };
};
