import { generateUploadUrl } from "../services/awsService.js";

export const getUploadUrl = async (req, res) => {
  generateUploadUrl()
    .then(url => res.status(200).json({ uploadUrl: url }))
    .catch(err => {
      console.error("Error generating upload URL:", err.message);
      return res.status(500).json({ error: err.message });
    });
};