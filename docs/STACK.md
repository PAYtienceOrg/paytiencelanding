# 技术栈

## 选型与理由

| 选型 | 理由 |
| --- | --- |
| Next.js（App Router、TypeScript、`src/`） | 静态/服务端渲染都支持，路由和字体优化开箱即用 |
| pnpm | 安装快、依赖严格 |
| Tailwind CSS | 主题 token 统一颜色和字体，不写散落的 CSS |
| framer-motion | 唯一的动画库，覆盖入场、滚动、手势 |
| zod | 表单（如候补名单邮箱）和接口数据校验 |
| Vitest + @testing-library/react + jsdom | 组件单元测试，速度快 |
| Playwright | 端到端测试（用例由后续卡片编写） |

## 常用命令

```
pnpm dev         # 开发服务器 http://localhost:3000
pnpm build       # 生产构建
pnpm typecheck   # tsc --noEmit
pnpm lint        # eslint
pnpm test        # vitest run
pnpm test:e2e    # playwright test
```

## 颜色与字体

在 `tailwind.config.ts` 中定义：

| 类名 | 值 | 用途 |
| --- | --- | --- |
| `paper` | `#F7F3EC` | 底色 |
| `ink` | `#1A1A1A` | 正文 |
| `accent` | `#1F4D3A` | 深绿强调色 |
| `rule` | `#D9D3C7` | 细分隔线 |

- 标题：Playfair Display（`font-serif`，变量 `--font-playfair`）
- 正文：Inter（`font-sans`，变量 `--font-inter`）
- 价格数字：加 `tabular-nums`（Tailwind 类）或 `.price` 类

## 目录约定

- `src/components/sections/`：页面区块
- `src/components/motion/`：通用动画组件
- `src/app/preview/registry.ts`：预览名到组件的映射；访问 `/preview/<名字>`，生产环境返回 404

## 不要引入

- 其他动画库（如 GSAP）
- UI 组件库
- Prisma / Drizzle 等 ORM
- CSS-in-JS
