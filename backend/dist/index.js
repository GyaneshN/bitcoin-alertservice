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
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const multer_middlewares_1 = require("./middlewares/multer.middlewares");
const uploads3_1 = require("./uploads3");
const redis_1 = require("redis");
const client_ecs_1 = require("@aws-sdk/client-ecs");
const dotenv_1 = __importDefault(require("dotenv"));
const connection_1 = require("./connection");
const User_controller_1 = require("./controllers/User.controller");
const Video_controller_1 = require("./controllers/Video.controller");
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const axios_1 = __importDefault(require("axios"));
const authenticate_middlewares_1 = require("./middlewares/authenticate.middlewares");
const fs_1 = __importDefault(require("fs"));
const Video_model_1 = __importDefault(require("./models/Video.model"));
const app = (0, express_1.default)();
dotenv_1.default.config();
app.use((0, cors_1.default)({
    origin: `${process.env.FRONTEND_URL}`,
    credentials: true,
}));
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
(0, connection_1.ConnectToDb)();
const publisher = (0, redis_1.createClient)({
    url: process.env.URL,
});
publisher.on("error", (err) => {
    console.log(err);
});
publisher.connect();
//routes
app.use("/user", User_controller_1.router);
app.use("/upload", Video_controller_1.router);
const ecsclient = new client_ecs_1.ECSClient({
    region: (_a = process.env.REGION) !== null && _a !== void 0 ? _a : "",
    credentials: {
        accessKeyId: (_b = process.env.S3_ACCESS_KEY) !== null && _b !== void 0 ? _b : "",
        secretAccessKey: (_c = process.env.S3_SECRET_KEY) !== null && _c !== void 0 ? _c : "",
    },
});
const config = {
    CLUSTER: "arn:aws:ecs:us-east-1:675754445188:cluster/builder-cluster",
    TASK: "arn:aws:ecs:us-east-1:675754445188:task-definition/builder-task",
};
(() => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield (0, uploads3_1.getSingleVideo)("1719056643963-74139872", process.env.BUCKET_NAME || "");
    console.log(response);
}))();
app.get("/", (req, res) => {
    res.send("hello world");
});
app.post("/upload", authenticate_middlewares_1.isUserLoggedIn, multer_middlewares_1.uploadVideo.single("video"), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _d, _e;
    const key = (_d = req.file) === null || _d === void 0 ? void 0 : _d.filename.split(".")[0];
    const filePath = (_e = req.file) === null || _e === void 0 ? void 0 : _e.path;
    // @ts-ignore
    const userId = req.user.id;
    const postdata = {
        userId,
        Key: key,
        redis_id: String(req.body.redis_id),
    };
    yield publisher.set(`redis_${req.body.redis_id}`, "Uploading");
    const response = yield axios_1.default.post(`${process.env.BACKEND_URL}/upload/newVideo`, postdata);
    if (response.data.success) {
        const result = yield (0, uploads3_1.uploadToS3)(key, filePath);
        console.log(result);
        if (result) {
            yield publisher.set(`redis_${req.body.redis_id}`, "Uploaded");
            console.log(req.body.redis_id);
            const url = yield (0, uploads3_1.getSingleVideo)(String(key), process.env.BUCKET_NAME || "");
            yield Video_model_1.default.findOneAndUpdate({ redis_id: req.body.redis_id }, { originalVideo: url });
            yield publisher.set(`redis_${req.body.redis_id}`, "Converting");
            const cmd = new client_ecs_1.RunTaskCommand({
                cluster: config.CLUSTER,
                taskDefinition: config.TASK,
                launchType: "FARGATE",
                count: 1,
                networkConfiguration: {
                    awsvpcConfiguration: {
                        assignPublicIp: "ENABLED",
                        subnets: [
                            "subnet-08c35232c39c400ae",
                            "subnet-06c155e958fa937d9",
                            "subnet-0952d735cb71a188d",
                            "subnet-01177fb0ba0493fef",
                            "subnet-0983c17ab619fcee2",
                            "subnet-0c22e11e62a096299",
                        ],
                        securityGroups: ["sg-096d2ecbd6d79b6c8"],
                    },
                },
                overrides: {
                    containerOverrides: [
                        {
                            name: "builder-image",
                            environment: [
                                { name: "KEY", value: key },
                                { name: "VIDEO_LINK", value: url },
                                { name: "REDIS_KEY", value: req.body.redis_id },
                            ],
                        },
                    ],
                },
            });
            yield ecsclient.send(cmd);
            fs_1.default.unlink(filePath || "", (err) => {
                if (err) {
                    console.log(err);
                    return;
                }
                console.log("unlinked successfully");
            });
            res.json({
                success: true,
            });
        }
        else {
            res.json({
                success: false,
            });
        }
    }
}));
app.get("/getRedisKeyStatus", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { redis_id } = req.query;
    console.log(redis_id);
    const status = yield publisher.get(`redis_${redis_id}`);
    res.json({ status });
}));
app.post("/UpdateStatus", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { redis_id } = req.body;
    try {
        yield Video_model_1.default.findOneAndUpdate({ redis_id }, { status: "Uploaded" });
        res.json({
            success: true,
        });
    }
    catch (error) {
        res.json({
            success: false,
            message: error,
        });
    }
}));
app.listen(3000);
