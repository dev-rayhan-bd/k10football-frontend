/* eslint-disable @typescript-eslint/no-explicit-any */
import { COUNTRY_CODES } from "./constants";

export const calculateAge = (dobString: string) => {
  if (!dobString) return "";
  let birthDate: Date;

  if (dobString.includes("/")) {
    const [day, month, year] = dobString.split("/");
    birthDate = new Date(`${year}-${month}-${day}`);
  } else {
    birthDate = new Date(dobString);
  }

  if (isNaN(birthDate.getTime())) return "";
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

/**
 * Age to display: from the date of birth when there is one, otherwise the
 * stored age. Returns "" when unknown (so callers can hide it, never show 0).
 */
export const getDisplayAge = (dob?: string, storedAge?: string | number): string => {
  const fromDob = calculateAge(dob || "");
  if (typeof fromDob === "number" && fromDob > 0) return String(fromDob);
  const stored = String(storedAge ?? "").replace(/\D/g, "");
  return Number(stored) > 0 ? stored : "";
};

export const getFlagUrl =(countryName: string) => {
  if (!countryName) return "";
  const code = COUNTRY_CODES[countryName.toLowerCase()];
  if (!code) return "";
  return `https://flagcdn.com/w160/${code}.png`;
};

export const handleImageUpload = async (
  file: File,
  field: string,
  handleUpdate: (field: string, value: any, file?: File) => void
) => {
  const reader = new FileReader();
  reader.onloadend = () => {
    handleUpdate(field, reader.result, file);
  };
  reader.readAsDataURL(file);
};
