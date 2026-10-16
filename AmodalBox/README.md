# AmodalBox project page

Standalone static project page for **AmodalBox: Automated 3D Bounding Box Annotation under Partial Visibility** (CoRL 2026). The academic layout follows the structure of the existing `OpenBox/` page. No build step, package installation, remote fonts, or JavaScript libraries are required.

## Preview

From the repository root:

```sh
python3 -m http.server 8000
```

Open `http://localhost:8000/AmodalBox/`. The folder also works as a GitHub Pages subdirectory. `index.html` can be opened directly for a file preview; if clipboard access is unavailable, the citation button selects the text for manual copying.

## Contents

- `index.html`: authors, paper link, three complete video comparisons, open-vocabulary examples, abstract, method, main results, ablation/robustness studies, supplementary experiments, failure cases, and citation.
- `static/css/style.css`: responsive layout and reduced-motion support.
- `static/js/main.js`: synchronized playback per example, timed PowerPoint highlights, highlighted-frame inspection, and citation copying.
- `static/paper/AmodalBox.pdf`: supplied paper, copied without changes.
- `static/images/`: paper figures, comparison posters, and a local favicon.
- `static/videos/`: nine displayed comparison clips with no audio, plus the three retained scene 44 clips from the first version.
- `static/qualitative-source.json`: original PowerPoint shape coordinates, timing, speaker-note captions, and media provenance.

## Source provenance

The supplied PDF and LaTeX ZIP both identify the project as AmodalBox, despite their OpenBox filenames. The venue is also established by this repository’s homepage. Affiliations follow the supplied paper. The abstract on the page is condensed, and the metric comparison is qualified to distinguish OV-SCAN from its variant without the semantic alignment head. Tables reproduce the aggregate nuScenes results (Table 1) and Waymo Scenario 1 results (Table 2a). The BibTeX entry contains the available title, authors, venue, and year; no DOI, proceedings volume, or arXiv identifier was supplied.

Main paper figures were rendered from the supplied LaTeX ZIP at 2400 pixels wide, except the failure figure:

| Website asset | Original source |
| --- | --- |
| `teaser.webp` | `Figure/Figure1.pdf` |
| `pipeline.webp` | `Figure/Figure2.pdf` |
| `alignment.webp` | `Figure/Figure3_v2.pdf` |
| `comparison.webp` | `Figure/Figure4.pdf` |
| `visibility.webp` | `Figure/Figure5.pdf` |
| `failure-cases.webp` | `Figure/Figure6.pdf` (full three-row failure figure, 2200 × 2055) |

Videos were extracted from the supplied `AmodalBox_supple2.pptx`, then encoded to H.264, yuv420p, 720 × 496 pixels, without audio and with fast-start metadata. The page now displays all three visible qualitative slides (12–14), each as an OpenBox / AmodalBox / Human Annotation comparison. Scene 20 is 20 fps with duplicated source frames; scenes 0 and 2 preserve the source 10 fps. Clips load on demand and do not autoplay. The previous scene 44 assets from hidden slide 16 are retained but are no longer shown.

| Website clip | Slide | Embedded file |
| --- | --- | --- |
| `scene20-openbox.mp4` | 12 | `ppt/media/media12.mp4` |
| `scene20-amodalbox.mp4` | 12 | `ppt/media/media14.mp4` |
| `scene20-human.mp4` | 12 | `ppt/media/media13.mp4` |
| `scene0-openbox.mp4` | 13 | `ppt/media/media18.mp4` |
| `scene0-amodalbox.mp4` | 13 | `ppt/media/media16.mp4` |
| `scene0-human.mp4` | 13 | `ppt/media/media17.mp4` |
| `scene2-openbox.mp4` | 14 | `ppt/media/media22.mp4` |
| `scene2-amodalbox.mp4` | 14 | `ppt/media/media21.mp4` |
| `scene2-human.mp4` | 14 | `ppt/media/media20.mp4` |
| `scene44-openbox.mp4` | 16 (hidden) | `ppt/media/media25.mp4` |
| `scene44-amodalbox.mp4` | 16 (hidden) | `ppt/media/media26.mp4` |
| `scene44-human.mp4` | 16 (hidden) | `ppt/media/media27.mp4` |

The red dashed ellipses are converted from the original PowerPoint shapes, including rotation and timing. Scene 20 shows its ellipses from 1 to 2 seconds, scene 0 from 1 second onward, and scene 2 throughout. The human-reference videos have no added highlights because none appear in the source. Initial previews and the inspection controls use 1.2 seconds for scenes 20/0 and 4.2 seconds for scene 2. The scene paragraphs reproduce the corresponding speaker notes, with the missing XML sentence boundary restored. Method labels are placed below the videos as requested.

Additional tables reproduce paper Tables 4–5 (ablation/robustness), Table 3 (density fallback), and appendix Tables 8–11 (small objects, runtime, cross-view association, distance/LiDAR visibility). Direct annotation evaluations on 50 training scenes are labeled separately from downstream detector results. Highlighted study rows mark the default configuration, not necessarily the highest metric. The failure figure preserves all three cases and the original orange highlights.

The ZIP’s `Rebuttal/Rebuttal_Figure/Figure1v2.pdf` supplies the **Stroller** and **Stone** open-vocabulary examples (panel B) and two additional 3D asset generation failure examples (panel A). Category names follow the figure’s embedded labels. The webpage shows faithful per-category crops, preserves the original full figure as `rebuttal-examples.webp`, and provides the unchanged source figure PDF as `static/paper/AmodalBox-rebuttal-examples.pdf`. The base/novel nuScenes AP table follows `Rebuttal/rebuttal.tex` (Table 1): OVM3D-Det 13.3/11.8, AmodalBox 26.5/23.2. The qualitative examples are not asserted to belong to that quantitative evaluation’s novel split. Earlier searches omitted the rebuttal subdirectory; those missing-source notes have been corrected.

Add public code, arXiv, or presentation links to `.publication-links` when their URLs are available. No release URLs are fabricated in this page. All assets stay inside this folder, apart from navigation links to the existing homepage and OpenBox page.
