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
  let processedFile = file;

  if (field === "coachImage" || field === "playerImage" || field === "profileImage") {
    try {
      const { toast } = await import("sonner");
      toast.loading("Removing background... Please wait.", { id: "bg-removal" });
      const { removeBackground } = await import("@imgly/background-removal");
      const blob = await removeBackground(file);
      const newFileName = file.name.replace(/\.[^/.]+$/, "") + ".png";
      processedFile = new File([blob], newFileName, { type: "image/png" });
      toast.success("Background removed!", { id: "bg-removal" });
    } catch (error) {
      console.error("Background removal failed:", error);
      const { toast } = await import("sonner");
      toast.error("Background removal failed. Using original image.", { id: "bg-removal" });
    }
  }

  const reader = new FileReader();
  reader.onloadend = () => {
    handleUpdate(field, reader.result, processedFile);
  };
  reader.readAsDataURL(processedFile);
};
