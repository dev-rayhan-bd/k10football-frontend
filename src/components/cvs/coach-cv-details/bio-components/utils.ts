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

export const getFlagUrl = (countryName: string) => {
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
