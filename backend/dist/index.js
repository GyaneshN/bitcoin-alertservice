"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const multer_middlewares_1 = require("./middlewares/multer.middlewares");
const uploads3_1 = require("./uploads3");
const redis_1 = require("redis");
const child_process_1 = require("child_process");
const app = (0, express_1.default)();
const publisher = (0, redis_1.createClient)({
    url: process.env.URL,
});
app.use((0, cors_1.default)());
app.use(express_1.default.json());
publisher.connect();
// (async () => {
//   const url = await getVideoUrl("1717917394427-343266241", "output-decoded");
//   console.log(url);
// })();
app.post("/upload", multer_middlewares_1.uploadVideo.single("video"), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const key = (_a = req.file) === null || _a === void 0 ? void 0 : _a.filename.split(".")[0];
    const filePath = (_b = req.file) === null || _b === void 0 ? void 0 : _b.path;
    const result = yield (0, uploads3_1.uploadToS3)(key, filePath);
    console.log(result);
    if (result) {
        const urls = yield (0, uploads3_1.getSingleVideo)(String(key), process.env.BUCKET_NAME || "");
        const cmd = `docker run -e VIDEO_LINK="${urls}" -e KEY="${key}" convertor2`;
        yield publisher.set(`${key}_redis`, "false");
        (0, child_process_1.exec)(cmd, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error executing command: ${error.message}`);
                return;
            }
            if (stderr) {
                console.error(`Command execution resulted in errors: ${stderr}`);
                return;
            }
        });
        let intervalId = setInterval(() => __awaiter(void 0, void 0, void 0, function* () {
            const redis_key = yield publisher.get(`${key}_redis`);
            if (redis_key == "true") {
                const links = yield (0, uploads3_1.getBulkVideos)(String(key), process.env.OUTPUT_BUCKET || "");
                console.log(links);
                res.json({ links });
                clearInterval(intervalId);
            }
            else {
                console.log("false");
            }
        }), 5000);
    }
    else {
        res.json({
            success: false,
        });
    }
}));
app.listen(3000);
