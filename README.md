# slider.js
### HTML markup
```HTML
<div class="slider">
  <div class="slide">...</div>
  <div class="slide">...</div>
  ...
  <div class="slide">...</div>
</div>
```
### JS slider declaration
```JavaScript
new Slider(document.querySelector('.slider'), sliderOptions);
```
### Slider options
| Option  | Type | Description |
| --- | :--: | --- |
| **arrows**  | bool | Enable arrows for switching slides |
| **bullets** | bool | Enable bullets for switching slides |
| **rollSpeed** | int | Speed of switching in mls |
| **slidesCountPerScreen** | int | Count of slides visible on the screen |
| **visibleOuterSlides** | bool | Enable visibility of slides out of the screen |
| **period** | int | Period of automatical slides switching |
| **onSlideChange** | function(*slideId*, *prevSlide*) | Callback function which is triggered after slide switching<br />*slideId* - sequence number of the slide<br />*prevSlide* - sequence number of the previous slide |
