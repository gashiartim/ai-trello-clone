import { storage } from "@/appwrite";
import { Image } from "@/typings";

const getUrl = (image: Image) => {
  if (typeof image === "string") {
    const parsedObj = JSON.parse(image);
    const url = storage.getFilePreview(parsedObj.bucketId, parsedObj.fileId);
    return url;
  }

  const url = storage.getFilePreview(image.bucketId, image.fileId);
  return url;
};

export default getUrl;
