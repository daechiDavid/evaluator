import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Evaluator · 교사 문장 생성기",
  description: "학생 순번 기반 교과 평가·행동특성·자율활동 문장 생성 도구",
  icons: {
    icon: [
      { url: "/assets/signature/final/dyk-favicon.svg", type: "image/svg+xml" },
      { url: "/assets/signature/final/dyk-favicon-32.png", sizes: "32x32", type: "image/png" },
    ],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ko"><body>{children}</body></html>;
}
