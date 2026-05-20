import { skills } from "@/data/works";
import { SquiggleLine } from "./Doodles";

export function About() {
  return (
    <section
      id="about"
      className="max-w-6xl mx-auto px-6 md:px-12 py-24 border-t border-line"
    >
      <p className="label mb-8">About</p>
      <div className="grid md:grid-cols-[1fr_2fr] gap-12 md:gap-20 items-start">
        <h2 className="font-display-cn text-3xl md:text-4xl text-ink leading-tight">
          关于我
          <SquiggleLine className="w-20 h-2 text-terracotta mt-3" />
        </h2>

        <div className="space-y-6 text-ink-soft text-[17px] md:text-lg leading-[1.85]">
          <p>
            我是一名<span className="mark">产品工程师</span>
            ，从设计、产品到全栈实现都参与。最近两年最让我兴奋的，是 AI
            把"创造一个东西"的门槛拉低了好多——
            许多过去需要几个月才能验证的想法，现在跟模型协作一晚上就能跑起来。
          </p>
          <p>
            我做的项目大多围绕同一个问题：
            <span className="mark-sage">如何让 AI 真正服务于普通人</span>
            ，无论是企业里的业务专家、社区里的孩子，还是招聘市场上的蓝领候选人。
            如果你正在做类似方向的事，欢迎聊聊。
          </p>

          <div className="pt-6">
            <p className="label mb-4">Stack</p>
            <div className="flex flex-wrap gap-2">
              {skills.map((s) => (
                <span key={s} className="chip">
                  {s}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
