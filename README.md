# Image Annotator

![](https://github.com/lukewu92/ImageAnnotator/blob/main/preview.gif)

## Requirements
Develop an Image annotator web application with just vanillaJS without using any external libraries.

## Features
- Annotate multiple images with multiple annotations
- Switch between images seamlessly by using side gallery or left right arrows.
- All text updates, drawn boxes and states are always updated to storage so no savings are required.
- Upload multiple images at once
- Toggleable side panels to see more of canvas area
- Export and load data (images and annotations data) - Due to browser storage limitations, this is the best approach.
- Left click on picture to draw boxes
- Middle click to position image for bigger images
- Mobile Responsive Design (UI wise works but didn't have enough time to fix touch events bug and develop pinch feature to zoom and out)

## Thought process and ideation

## Design
1. Gather requirements and identify what's the main issue the product is solving.
2. Study similar products or popular/mainstream product or competitors to study UI/UX similarities which relate to users.
3. Design a scalable and intuitive layout that allows the user to switch back and forth from drawing rectangles/writing annotations or switching image.
4. Common offline/online tools these days have side panels on both left and right. Idea is to replicate that same usability.


## Development process
- Identify data structures for all of the data required (image data, position of annotation, size of rect, annotations)
- Due to many moving parts that need to work together, decided to build state management system to share state across different components.
- Work on initial layout first before diving too deep into nested DOM.
- Build panels on layout that can be hidden, giving more space for content/canvas.
- Ensure these layouts are responsive as well as canvas.
- Implement upload file process and create blob out of uploaded file.
- Display images on panels and canvas (drawing on canvas was slightly more complicated than I imagined, since drawing anything on canvas is just paint, it's hard
  to identify if mouse or clicks are on any drawn item. And also drawings can't be targetted, so these images are repeatedly cleaned and redrawn)
- But I've a little bit of game development experience and they work the same way, drawn every frame and positioning items and identifying boundary boxes are
  the same in game development.
- A highly saturated and uncommon color is picked to draw above the image so it pops out better, stroked and opaque fill.
