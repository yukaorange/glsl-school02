# created in astro / using three js
 
 I was tryna intracvive webgl animation.
 I analyzed a reference website to create a geometry shaped into a circle, and also implemented a texture swap that fits the shape. This was done in the context of scroll interaction."

 inspired: https://asmobius.co.jp/
 deploy: https://glsl-school02.vercel.app/


# starting with

```
npm i 
npm run dev
```

## creator subject
（要検討）
・円形ジオメトリの大きさを画面立幅に合わせたいので、planeを変形するのではなく、バッファジオメトリで自作すべきかと。

（未達成）
・ゆらぎの演出が参考サイトをもっと良く分析して模倣したい
・ローディング時のアニメーションやsvg（半径のレスポンシブ）の導入など、未達成の課題も山積
・テキストやリンクの変更はおそらくajaxなので、追加したい。
・ページ遷移spa。

## packages

representative packages

| title                  | Version                                          |
| :--------------------- | :----------------------------------------------- |
| `eslint`               | 8.49.0                                           |
| `prettier`             | 3.0.3                                            |
| `sass`                 | 1.58.1                                           |
| `stylelint`            | 15.10.3                                          |
| `gsap`                 | 3.12.2                                           |

