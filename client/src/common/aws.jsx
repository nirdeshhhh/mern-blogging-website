import axios from "axios";

export const uploadImage = async (img) => {
  let imgUrl = null;

  await axios.get(import.meta.env.VITE_SERVER_DOMAIN + "/get-upload-url")
    .then(async ({ data: { uploadUrl } }) => { 
      await axios({
        method: 'PUT',
        url: uploadUrl, 
        headers: { 'Content-Type': 'image/jpeg' },
        data: img
      });

      imgUrl = uploadUrl.split("?")[0]; //extract URL without params
    })
    .catch(err => {
      console.error("Error uploading image:", err.message);
    });

  return imgUrl;
};
