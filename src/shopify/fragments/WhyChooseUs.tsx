import {FC} from "react";

export type WhyChooseUsProps = {};

export const WhyChooseUs: FC<WhyChooseUsProps> = (props) => {
    const {} = props;
    return <div className="py-4 mt-8 border-none">
        <div className="flex items-center justify-center gap-4">
            <div className="h-px bg-[#333] flex-1 scale-y-50"></div>
            <div className="text-[14px] font-semibold tracking-wide text-[#333]">Why Choose Us</div>
            <div className="h-px bg-[#333] flex-1 scale-y-50"></div>
        </div>
        <div className="mt-4 space-y-4">
            <div className="grid grid-cols-[56px_1fr] gap-3 items-start">
                <div className="flex items-center justify-center"><img alt="30-day satisfaction guarantee"
                                                                       className="w-[56px] h-[56px] object-contain"
                                                                       src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADUAAAA8CAYAAADG6fK4AAAAAXNSR0IArs4c6QAACaZJREFUaEPNm21QVNcZx5+zu7yDLiJoExUsViZi68qF2JqpAafJJ/GtTprSRkzbwUmrNalmYjttQdMZkyY2WDNaTSdIjJpmphGVfohjIpkqUwMX1pikI6JVcCIaWRaW12Xv3s7/sHe9e1n25e6yer7g7j17zvnd/3Oe85zzHBlNQrFYLDlGo3EVEa1WmmeMWRljtU1NTdZJ6NKnSRbNDgRBKCeiDURUHKBdQFVLknTCarXao9m/9wVG2ihUMZlMW2RZBoxZ3V6G2TQ8e6bJZOtzD3d85UzV9AWgOoPBsCfa6ulWqrCwcJUsy89rVUlOYu7lS1INZaXpND8n3svx1Z1ROvavXjrxUa97cEg2aACjql5YUFDFYDCUM8agSo56YPOyE6SflE41Fj+aSmkp2jH7Ipw620enPu6jli+HtYZiZ4wdcrlce6xW63W9VhQSlEcVgHgnvtLhiuI00qoS6mCCqNdARIdEUawNtb2gc8pisZgNBsMWf6rMzDS5y1aYDaUlU4KqEuqAoN6x+l5quz4SsXrjlCosLCyWZVnxYj4dQJXS5VNIyE8Kdaxh12u77qSjp3ro4wsD0uCQ26hpICT1vFCCIMC03tDOlawMk+unK82maKoSCqljwE0Nn/bTkVO9UvuNES0c5lu1KIp7/LXFoQRBqPGsL946jxelcFWKH00JZQyTWkdR76P/DLiGht0mVWdWSZJKtOsd85jbWVRMiGfO8jXp8TCzh7LiJnWgehqHeph7tcftw912V6KnjT2iKGJp8RYmCEIdEa1KiGcjNbtmJ6jXFj0dx+I3gFv36w4FzC6KYroWqgeRAMxt9/ZvxGJMUenj4Ps2OvgPG29LkqR0tQlCKRkPKn40jSqemhaVDmPRiBqKMVbS3NwMz8jLpENd7ZQod7bWeUWOfd+g3jk5SIdPDnGov1X6xLoRU903qK1/7qXP2lwcAFDRVOyBgHr9xSm0KC96y0RMoS5eHqXT50cIf293u71mlprMKHe2iZ58LIGWWuIJnyMpMYPa994AHT8zbjsxbuwA2vZsKj22+N5+K1zAmEApTiGcwb34s1R6cmlCOD/x1o0J1OrNNhoY4kseL8+sTOJzCCYHM7za6aIPzw17HQfqQLHjf9W3Nk46FObPttf6fIDWr0z2q8D5Vie99nY/fwGYWzs2pT2YSmmhgnk6KNd1V4rIGz5QSumSxc+PJh0KfWrnFBzA+lXJNCMj8CGMXsiYQE3k/eAsorU2qV9ATKDQYbB1CuvSmh8kRjSXFLCYQaFDOI19xwbo2k1pQsuCelW/SosoqogplEKCLceH54epsRXh0nhArFGHX0nXDXZfoNQyKfHg6UbfMz0oBvevp9x3KLV62I6oI493X03X5SEfGCjAQS1EFEoJtlBPpGJIUD9eYaatz07XYwnc613rlLjrDhagaqMPOAw90XowKKRRFhUsSKSDL88KG0o7yF8+ncLd9kRFu55FQylRFH02Z6ygoKCBMfa4XijEcRur7D7zBNv2tU8k+ajWPyjzvRaglJKSxKhur74ovWrvbapvcPCmxkEJgnCIiMqRUzr7zjfDVsrfPAm1EWxPJormg7VR8YebPL8ly/InLS0tPulYHDtXybJciUYAFSxhNlFnMMPKNx0+igUaGOYeNol6S/Ez16h/kB8X+D12RrbjOJ5WbsoiZDf0FpjYB2eG6PR5p98FF+1iD7X2ichDpdo6W+vewzYDY+x59UEm+lCyHkgqT0Xe6cDOh/Uy+fwOgFiTlHDpuadTaG0AB+KvU5yZX7nhJGQcUZC0mDndOJa8kOU1bO77yAOMKwoUn1d4enJ/dtQyHupzv3C8nPjFEB2rt1PDpwN+X/C87Hip/YZza8D8VFFRkcXtdreihWieqWORxWIbqpeDMttevUWACrHUiqKIXDQvSEvBFNWZRGTnsvHw6O45PtcFQuxgXDWYYKPVybcawTaLMDEAIcHmHeQymeLnOMg0x0ESuSmVJZC9OUNqaTDYRkdYJmNsR3NzcxXqK14c33mh1GrBZo+8Plu3Jwz3JUChjX+86QV6OJvRwoqb5JjV5b8pmb62tabXZRb2VFYvoFsKkKdyrc9KrHbv8ILwhrEou2vu8jnE3/gymVJ+biUX3TvdnXAMjN6+UGFJlYaNT3nqXJQkqXjc2a8gCDxsQqVYgMHsVj53g48pI5PRwp2f02hy8FNe1G9/K4funMtQmDkQkm/joDw3wAA2FbWRyK7cNGPSTPFovZ3+UnOXD6z0993U/a3QLrqogYwJ7jbnoLxEySb6PaX3gGEN4IohD3xg56xJASvb2skvhCQnMyrc38LNzjVopPa/51DidCfllHWOsz41UMqcIXrkhfadB5Y5eVSEMmHqATdejEYjUo4cDOETFIv2FYTCH7bzgeQ+ItOM7S3833f+ncGhULK+303zfnFPPS1Q/m8vkzFJqm8sL/gnY6zGYDAsDppP0XiWqJujAlWyzkUjpRc5CJT6YlceDXSM3axRwPwBmZIlGupKuNT60sJvc5UYKwkKhYoFBQUbGGPVyjyDy4dnjMZ1HgVq+TqJhkvvXdrUgiVmOmn467HUD0wOCgEIpafV/Nl/q3O/ExYUKnuuxR3C3kux3bIVZvqNzt2y0oYSbVsKDZS8ucln/mjB/AHhu/a3clrvnMtYHDaU0pt6LcN3cCJVm2fqjkC2vnKLPmkai/GK9lmvxqVIuWoyNZhWIaVe02ZLx2ifcQ4R9YqiaA7J/HxeHzofixURBHMngoI7GIgbwy1HTtovv1F7Nw+/m760p3H+xmtLtW0AzCaaaZpg95qcUsdxJe3CpT/NX+L5zGNBXVBKg4IgYJ5t8X7OT+JzLdC9JoREO968zUOi/ZUP/W7Wdz/YJQgCjzuZkRwLX2r7Mi3PoQwy4Dty9Ru7mrYsmiK7GE+GSZI0Fzc6I4JCQ54LW1CNB8Nw/Zhn/jabiL4RtAJMsX9E1Z5reXyjyoxyf/72K5emzHd8LxDRUFfCjc9fzmOj/XEwOxTvDjhiKLTmWdMAhrvovMAzlpWaKS1l7LYLLiaq90c4W3C73auVKEA9V5mBHBlFNuvc9Z0ZcamuBRq4rv8dndXRdSYrX5aYcm/voiiKFqVeVKBU5oijAcDxEGuiIsvyCy0tLTBdn6J1QngYN3X0UuK00UGZERuxmVJH7fFayBOSJG3wuXAVqHM9zzyqYY/jnWuqdmolSaoKdJNZa84BxtCLtVPZT6nrRVUpdcOeS/iIdXAnFzcoreFcy/bMs9WyLOeo1kaEHNdlWa5zu911E/0PhP8DVOA04KiO7IQAAAAASUVORK5CYII="/>
                </div>
                <div>
                    <div className="text-[14px] font-semibold text-[#111] leading-tight">30-day Satisfaction
                        Guarantee with Money Back
                    </div>
                    <div className="mt-1 text-[14px] text-[#444] leading-snug">If you're not satisfied with the
                        products, we will issue a full refund without questions,and include your shipping costs!
                    </div>
                </div>
            </div>
            <div className="grid grid-cols-[56px_1fr] gap-3 items-start">
                <div className="flex items-center justify-center"><img alt="Successfully shipped orders"
                                                                       className="w-[56px] h-[56px] object-contain"
                                                                       src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADwAAAAmCAYAAACYsfiPAAAAAXNSR0IArs4c6QAABidJREFUaEPtmm1MU2cUgM+5VKUyIzIsJnWUISabuli4xT9mCrJNl6iTEGKW/UCn2xzMRZdBlY0J0Y2iWZx/+GFG0MREkKGwJc5kcXbZH5TeWrJBthSyGpfBmCyFieBH71nOpbe5LaXyaah6khvCve/Hed5zzvtx3iL4xWw2x8fExBwHgB3qu1n21+7z+XJdLpd3KnqhWjkjI2MfIjLwbJbTkiRNySBaYDsirrdYLD2bN29eMpuoL1269G9LS0sCEf3kdDqzpqLbKOD8/HzgZzZJQ0MD8PMUeBJWiQoLHzt2DFpbWxmPJyxXJE5EdCHi6dbW1rDlogK4oqIC2tvbJ2RPItrpdDpPhVaKLuD58TKlbxQASA5L7/0b8c8OhP5/lM+ImO1wOOzaslEFTItND2jncV1EUw8PgnBqvw8GbsUAQLMkSdseb2Cmc3wHwo+1CqckSQGjKlbXbDyUdXg2LkuTiWGV6ylwNFl4iXGpr8haxrEZUco+fE/5TkT7nU7nV1Ebw6ZlaQ+O19ZFnrQA4K2N63xDQ3dinhjgT/e+Qx1t13l+GnXYiKpJa7wWrq89CfzwrkySpPTH3qWv/myHqk8+jt5lST0tPWyyGuO7h4hOOZ3OiqhZh6cIrI6DXZKkbG0M70hISLDt3r07KTMzc5KDOTPVAsCGFKCcXePvZPg2wC9XADuvBZapoG1XV1dXOQAcGn+Lj6ZkIAHw3EqgNw9PuFOsr+jHG20LOYHwZAC7rwJeqFIGKgBssViykpKSavfs2ZOyYsWKCY/iTFaYsoVvtgOeLQsGFkWxCQDemI2Hh2kFXrNmzfOc7wWAQgBYtnr1auCHJT09HYxG44SNx+kYj8cz4XpjVXC73eByuYAmG8NaC4uiSJE0q6mpgQULFihF7Ha7klsaHBxU/jcYDJCVlQXaEGDQkpKSaYNV++nt7R0NPDwI+OsVgJvtADwjs8QnAazKVsqqgiHA1QCwhYgWI+I8vV4P/LCYzWawWCyQmJgI1dXVY1qNoQsKCiAuLk4ZDD6/TqeFeWBDgbHXA3jBBtDfG35wLVtA3rBzJG7DxXBGRkbYBAB3ZLVaA1Y1Go1DycnJ1wYGBgw9PT3L+/r6lNMLr93FxcXTalm1MTUBoLq0AltXBjA84mlkMN2CRcZ2uNNvQG/PcvhvRCd6aQPQ6x9EBs7Ly7u7ffv2eWpn5eXl0NHRwVYnURQ/O3HixBEtVVFRUUdLS8uL/K6wsFBx8emWUcBnyxQImKsnWpn9kfPrw4Ezb3rREZPQ/cdluOFapkDnWgFinwk7S3NKs0Cv198ymUzxgiDo7t27B52dnYr+aWlpl+vr61+x2WzvcyqIiAYEQWgqKSm5mJOTM+T1emNjY2MhNTV1unnB7XYP3b9/Xw+xcQDxSwB6ukYsmyqedzaczLPZbHxSWAcAfbIsN5eWljaJa9ffheHbc2nefICFBmCvABQGg9ZhIroylracG6qsrMxFxPOaMrd1Ot0qu91+qLu7eyRgHp2QJElCVVXVViJq1nT7w4EDB17LeDn7e7wzsEmrDj27tDFop8WbDwDQ+mQWEa1HxJsOhyO5srLyICJ+EdQI0avnzp1LFAThrP/9aUScvjVpJFWTgoixAPAb68c6AcDvkiS9YLPZeAsVtCzMmTMn+cyZM2tVnRCxQpZlDyfmg4BDjaO9QvVb+G1ErNGUc8uyXNDY2JgEABf4vc/nWzTVO9xITmKxWMqJiPf7XkmSFh09evRdWZb5mnc+10PEi4i4q66ubhMiKrlabeYyInBmZqZZluXrfgVy8/Pz2eX3cqwDwF+yLH9ZWlr6rbpLA4AbkiSlzKRXsxeqoafeLNhsts8B4CD3j4jFVqv1G3XVAYA2SZLMqk4RgbmQpqJXEITs0EsqrRew6zgcDj5xzaiIosghYwIAjyAIuaE6abyAwyHojumhwH4r8/3MQj8Fz+YuIopHRG3MB43kTBKHeB53xTrZ/bEe0CncffJDgbk1vxvx4UKFDuVp8/l8WTMZu6EdiqLId0YMGlYnhpVleVuoTuMC5s74Ry86nW4fEXFHyumCG+VOw11LzqSF1bb9P8ThEGKd2MVZmomoaSyd/geDs1xzWmJ9IgAAAABJRU5ErkJggg=="/>
                </div>
                <div>
                    <div className="text-[14px] font-semibold text-[#111] leading-tight">Over 20,000+ Successfully
                        Shipped Orders
                    </div>
                    <div className="mt-1 text-[14px] text-[#444] leading-snug">We made as much happy customers as
                        many orders we shipped. You simply have to join our big family.
                    </div>
                </div>
            </div>
            <div
                className="grid grid-cols-[56px_1fr] gap-3 items-start pt-2 text-[10px] text-[#E1E1E1] leading-snug">
                <div className="w-[56px]"></div>
                <div>We will charge different insurance premiums and taxes based on the laws and regulations of
                    various countries.
                </div>
            </div>
        </div>
    </div>
        ;
};
