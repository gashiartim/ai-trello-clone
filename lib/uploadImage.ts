import { ID, storage } from "@/appwrite";

const uploadImage = async (file: File) => {
  if (!file) return;

  const fileUploaded = await storage.createFile(
    process.env.NEXT_PUBLIC_IMAGES_STORAGE!,
    ID.unique(),
    file
  );

  return fileUploaded;
};

export default uploadImage;
