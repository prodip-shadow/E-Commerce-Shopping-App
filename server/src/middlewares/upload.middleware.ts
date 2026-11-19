import multer from "multer";


const storag=multer.memoryStorage();

const upload=multer({storage:storag});

export default upload;