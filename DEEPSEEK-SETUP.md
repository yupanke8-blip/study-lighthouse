# 复习灯塔EVAN：DeepSeek 后台

网页继续使用 https://yupanke8-blip.github.io/study-lighthouse/ ，学习记录无需搬家。

1. 在 https://dash.cloudflare.com/ 注册并验证邮箱。
2. Workers & Pages → Create application → Import a repository，连接 GitHub，选择 study-lighthouse，分支 main，根目录保持仓库根目录。部署命令 `npm run deploy`，无需构建命令。配置已在 wrangler.jsonc 中。
3. Worker → Settings → Variables and Secrets → Add，类型均选 Secret：
   - DEEPSEEK_API_KEY：你创建的 DeepSeek 密钥。
   - STUDY_ACCESS_TOKEN：你自己生成的至少 24 位随机访问口令（密码管理器可生成）。它是访问你私人后台的密码，不是 DeepSeek 密钥。
4. Deploy，复制 Worker 的 https://…workers.dev 地址。
5. 在复习灯塔「资料与课程 → 连接设置」填写后台地址和 STUDY_ACCESS_TOKEN，检查连接。DeepSeek 密钥只放 Cloudflare，不填网页或聊天。
6. 保存一份短资料并自动生成，余额不足时到 DeepSeek 平台小额充值，再继续。

健康检查只检查后台配置和访问口令；真实 API 密钥及余额在首次生成时验证。每批最多 9000 字符，通常调用两次模型：生成及独立复核。已保存的批次会跳过，失败批次可手动重试（可能再次收费）。访问口令只在页面内存保存，刷新需重新输入。

本版支持文字型 DOCX、PPTX、PDF、TXT、MD；PPTX 按实际幻灯片顺序读取。图片、扫描页和复杂公式尚无 OCR，需补充文字。AI 复核并不保证绝对正确。上传资料和生成内容暂存于设备浏览器，未提供跨设备云同步。

本地终端受沙箱故障影响；代码在 GitHub 修改，测试由 GitHub Actions 执行。实际 DeepSeek 调用及 iPad 浏览器操作仍需部署密钥后验证。
