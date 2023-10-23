const path = require("path");
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const { init: initDB, Counter } = require("./db");

const logger = morgan("tiny");

const app = express();
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cors());
app.use(logger);

// 首页
app.get("/", async (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.post("/", async (req, res) => {
  console.log("Received event:", req.body);
  const { ToUserName, FromUserName, MsgType, Content, CreateTime, Event } =
    req.body;
  const appid = req.headers["x-wx-from-appid"] || "";

  if (Event === "subscribe") {
    console.log("Received subscription event:", req.body);
    const { ToUserName, FromUserName, Event } = req.body;

    if (Event === "subscribe") {
      const appid = req.headers["x-wx-from-appid"] || "";
      try {
        // Send the original message
        const result1 = await sendmess(appid, {
          touser: FromUserName,
          msgtype: "text",
          text: {
            content: `非常感谢您关注伊甸数智！我们专注于数字化骨科康复生物力学研究和AI智能应用，致力于打造国际领先的数字化骨科康复矫形与智能假肢创新技术与产品，为消费者提供个性化的数智解决方案。

1.即刻预约，体验优质数智服务。点击<a href="https://ud8dwa5smb.jiandaoyun.com/f/643915f4aa01e10008bb341b?ext=%E5%85%AC%E4%BC%97%E5%8F%B7">「预约到店」</a>。

2.查询预约，快速获取预约信息。点击<a href="https://ud8dwa5smb.jiandaoyun.com/q/643915f4aa01e10008bb341b">「点我查询」</a>。

更多咨询请拨打：
客服热线:0755-82524196
在线客服:18126328460（微信同号）

期待与您一同迈向数智化康复未来。`,
          },
        });
        console.log("发送消息成功", result1);

        res.send("success");
      } catch (error) {
        console.log("发送消息失败", error);
        res.status(500).send("Failed to send message.");
      }
    } else {
      res.send("success");
    }
  } else if (MsgType === "text") {
    // Handle message push
    if (Content === "我的报告") {
      try {
        const result = await sendmess(appid, {
          touser: FromUserName,
          msgtype: "text",
          text: {
            content: "你的报告在这里",
          },
        });
        console.log("发送消息成功", result);
        res.send("success");
      } catch (error) {
        console.log("发送消息失败", error);
        res.status(500).send("Failed to send message.");
      }
    } else if (Content === "开始扫描") {
      try {
        const result = await sendmess(appid, {
          touser: FromUserName,
          msgtype: "news",
          news: {
            articles: [
              {
                title: "聚焦足部健康，从脚型测量开始！",
                description: "手机拍照，即享3D足型扫描",
                url: "https://yd-wx.epoque.cn/sweeping/",
                picurl:
                  "https://oss-yd-foot.oss-cn-shenzhen.aliyuncs.com/yd_photo/scan_icon.jpg",
              },
            ],
          },
        });
        console.log("发送消息成功", result);
        res.send("success");
      } catch (error) {
        console.log("发送消息失败", error);
        res.status(500).send("Failed to send message.");
      }
    }
  }
});

// 更新计数
app.post("/api/count", async (req, res) => {
  const { action } = req.body;
  if (action === "inc") {
    await Counter.create();
  } else if (action === "clear") {
    await Counter.destroy({
      truncate: true,
    });
  }
  res.send({
    code: 0,
    data: await Counter.count(),
  });
});

// 获取计数
app.get("/api/count", async (req, res) => {
  const result = await Counter.count();
  res.send({
    code: 0,
    data: result,
  });
});

// 小程序调用，获取微信 Open ID
app.get("/api/wx_openid", async (req, res) => {
  if (req.headers["x-wx-source"]) {
    res.send(req.headers["x-wx-openid"]);
  }
});

const port = process.env.PORT || 80;

async function bootstrap() {
  await initDB();
  app.listen(port, () => {
    console.log("启动成功", port);
  });
}

bootstrap();
