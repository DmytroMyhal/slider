'use strict';

function PXtoVW(val) {
  return 100 * val / window.innerWidth;
}

class Slider {
  constructor(block, settings) {
    this.container = block;
    this.slidesCount = block.children.length;
    
    if(!settings.slidesCountPerScreen) settings.slidesCountPerScreen = 1;
    if(!settings.rollSpeed) settings.rollSpeed = 0;
    
    this.settings = settings;
    
    this.initialize();
  }
  
  getSlideWidth(slideId) {
    var slideStyle = getComputedStyle(this.slides[slideId]);
    var slideWidth = parseFloat(slideStyle.width) + parseFloat(slideStyle.marginLeft) + parseFloat(slideStyle.marginRight);
    return slideWidth;
  }
  
  createBullet(bulletId) {
    var bullet = document.createElement('div');
    bullet.classList.add('dot');
    bullet.onclick = this.showSlide.bind(this, bulletId);
    this.bulletsContainer.appendChild(bullet);
    this.bullets.push(bullet);
  }
  
  activateBullet(bulletId) {
    if(this.currentSlide != null) 
      this.bullets[this.currentSlide].classList.remove('active');
    this.bullets[bulletId].classList.add('active');
  }
   
  rollFeedToSlide(slideId, direction) {
    this.blockSlideChanging();
    
    var animationOffset;
    var offset = this.slides[slideId].offsetLeft;
    
    var oppositeDirection = false;
    if(direction)
      oppositeDirection = direction != Math.sign(slideId - this.currentSlide);
    
    if(oppositeDirection) {
      if(slideId == 0)
        animationOffset = this.feed.offsetWidth;
      else if(slideId == this.slidesCount - 1)
        animationOffset = -this.getSlideWidth(this.slidesCount - 1);
    }
    else
      animationOffset = this.slides[slideId].offsetLeft;

    this.feed.style.transform = `translateX(${-animationOffset}px)`;
    this.feedOffset = offset;
    
    var feedStyle = getComputedStyle(this.feed);
    var animationDuration = parseFloat(feedStyle.transitionDuration) * 1000;
    var transition = feedStyle.transition;
    
    setTimeout((function() {
      if(oppositeDirection) {
        this.feed.style.transition = 'all ease 0s';
        this.feed.style.transform = `translateX(${-this.feedOffset}px)`;
        
        setTimeout((function(){this.feed.style.transition = transition;}).bind(this), 30);
      };
      
      if(this.settings.infinite) {
        this.clonesAfter.firstChild.classList.remove('active');
        this.clonesBefore.lastChild.classList.remove('active');
      };
      
      this.unblockSlideChanging();
    }).bind(this), animationDuration);
  }
  
  blockSlideChanging() {
    this.isChangingBlocked = true;
  }
  
  unblockSlideChanging() {
    this.isChangingBlocked = false;
  }
  
  findDirection(prevSlide, nextSlide) {
    if(this.settings.infinite) {
      if(prevSlide == 0 && nextSlide == this.slidesCount - 1)
        return -1;
      else if(prevSlide == this.slidesCount - 1 && nextSlide == 0)
        return 1;
    };
    
    return Math.sign(nextSlide - prevSlide);
  }
  
  showSlide(slideId) {
    if(this.isChangingBlocked) return;
    if(this.currentSlide == slideId) return;
    
    var prevSlide = this.currentSlide;
    if(prevSlide != null) {
      if(this.settings.infinite) {
        if(this.currentSlide == this.slidesCount - 1)
          this.clonesAfter.firstChild.classList.add('active');

        if(this.currentSlide == 0)
          this.clonesBefore.lastChild.classList.add('active');
      };
      
      this.rollFeedToSlide(slideId, this.findDirection(prevSlide, slideId));
      this.slides[prevSlide].classList.remove('active');
    };
    
    if(this.bulletsContainer) this.activateBullet(slideId);
    
    this.currentSlide = slideId;
    this.slides[slideId].classList.add('active');
    
    if(this.settings.period) {
      clearTimeout(this.timer);
      this.timer = setTimeout(this.nextSlide.bind(this), this.settings.period);
    };
    
    if(this.settings.onSlideChange) this.settings.onSlideChange(slideId, prevSlide);
  }
  
  prevSlide() {
    if(this.currentSlide != 0)
      this.showSlide(this.currentSlide - 1);
    else {
      if(this.settings.infinite)
        this.showSlide(this.slidesCount - 1);
      else return;
    };
  }
  
  nextSlide() {
    if(!this.settings.infinite && this.currentSlide == this.slidesCount - this.settings.slidesCountPerScreen) return;
    
    if(this.settings.infinite && this.currentSlide == this.slidesCount - 1) {
      this.showSlide(0);
      return;
    };
    
    this.showSlide(this.currentSlide + 1);
  }
  
  createClones() {
    this.clonesBefore = document.createElement('div');
    this.clonesBefore.classList.add('clones');
    
    var from = this.slidesCount - 1;
    if(this.settings.visibleOuterSlides) from = 0;
    for(var i = from; i < this.slidesCount; i++) {
      this.clonesBefore.appendChild(this.slides[this.slidesCount - 1].cloneNode(true));
    };
    
    this.clonesAfter = document.createElement('div');
    this.clonesAfter.classList.add('clones');
    
    var to = this.settings.slidesCountPerScreen;
    if(this.settings.visibleOuterSlides) to = this.slidesCount;
    for(var i = 0; i < to; i++) {
      this.clonesAfter.appendChild(this.slides[i].cloneNode(true));
    };
    
    this.clonesBefore.style.position = this.clonesAfter.style.position = 'absolute';
    this.clonesBefore.style.display = this.clonesAfter.style.display = 'flex';
    this.clonesBefore.style.top = this.clonesAfter.style.top = 0;
    
    this.clonesBefore.style.right = '100%';
    this.clonesAfter.style.left = '100%';
    
    this.feed.insertBefore(this.clonesBefore, this.slides[0]);
    this.feed.appendChild(this.clonesAfter);
  }
  
  createWindowBlock() {
    const block = document.createElement('div');
    block.classList.add('window');
    if(!this.settings.visibleOuterSlides) block.style.overflow = 'hidden';
    return block;
  }
  
  createFeedBlock() {
    const block = document.createElement('div');
    block.classList.add('feed');
    block.style.position = 'relative';
    block.style.display = 'flex';
    block.style.transition = 'transform .' + this.settings.rollSpeed/100 + 's ease';
    return block;
  }
  
  moveSlidesBlocks() {
    const slider = this;
    
    slider.slides = [];

    const computedStyle = window.getComputedStyle(slider.container, null);
    const paddingLeft = parseInt(computedStyle.getPropertyValue('padding-left'));
    const paddingRight = parseInt(computedStyle.getPropertyValue('padding-right'));
    
    const slideMarginRight = parseInt(window.getComputedStyle(slider.container.firstElementChild, null).getPropertyValue('margin-right'));
    
    const width = (slider.container.offsetWidth - paddingLeft - paddingRight - slideMarginRight * (slider.settings.slidesCountPerScreen - 1)) / slider.settings.slidesCountPerScreen;
    
    [].forEach.call(slider.container.children, function(child, i) {
      slider.slides.push(child.cloneNode(true));
      slider.feed.append(slider.slides[i]);
      slider.slides[i].style.flexShrink = 0;
      slider.slides[i].style.width = PXtoVW(width) + 'vw';
      slider.slides[i].style.boxSizing = 'border-box';
    });
    
    slider.feed.style.width = slider.slidesCount * PXtoVW(width + slideMarginRight) + 'vw';
  }
  
  createArrowsBlocks() {
    const slider = this;
    
    slider.prev = document.createElement('div');
    slider.prev.classList.add('prev');
    slider.prev.classList.add('arrow');

    slider.prev.onclick = function(e) {
      e.stopPropagation();
      slider.prevSlide();
    };

    slider.next = document.createElement('div');
    slider.next.classList.add('next');
    slider.next.classList.add('arrow');

    slider.next.onclick = function(e) {
      e.stopPropagation();
      slider.nextSlide();
    };

    slider.prev.style.position = slider.next.style.position = 'absolute';
    slider.prev.style.cursor = slider.next.style.cursor = 'pointer';
    
    slider.container.append(slider.prev);
    slider.container.append(slider.next);
  }
  
  createBulletsContainerBlock() {
    this.bulletsContainer = document.createElement('div');
    this.bulletsContainer.classList.add('bullets');
    this.bullets = [];

    const bulletsCount = this.slidesCount - (this.settings.infinite ? 0 : this.settings.slidesCountPerScreen - 1);
    for(var i = 0; i < bulletsCount; i++) {
      this.createBullet(i);
      this.bullets[i].style.cursor = 'pointer';
    };

    this.bulletsContainer.style.display = 'flex';
    this.bulletsContainer.style.justifyContent = 'center';
    
    this.container.append(this.bulletsContainer);
  }
  
  rebuildDOM() {
    const slider = this;
    
    slider.container.style.position = 'relative';
    slider.container.style.boxSizing = 'border-box';
    
    const windowBlock = slider.createWindowBlock();
    slider.feed = slider.createFeedBlock();
    
    this.moveSlidesBlocks();

    slider.container.innerHTML = '';
    
    if(slider.settings.arrows && slider.slidesCount > slider.settings.slidesCountPerScreen)
      slider.createArrowsBlocks();
    
    windowBlock.append(slider.feed);
    slider.container.append(windowBlock);
    
    if(slider.settings.bullets && slider.slidesCount > slider.settings.slidesCountPerScreen)
      slider.createBulletsContainerBlock();
  }
  
  setSwipeListener() {
    const slider = this;
    
    slider.container.ontouchstart = function(startEvent) {
      var startX = startEvent.changedTouches[0].pageX;
      var swipeStarted = true;
      var swipeDone = false;
      this.container.ontouchmove = function(moveEvent) {
        var newX = moveEvent.changedTouches[0].pageX;
        var offset = newX - startX;
        if(swipeStarted && !swipeDone && Math.abs(offset) > 40) {
          swipeDone = true;
          offset > 0 ? slider.prevSlide() : slider.nextSlide();
        };
      };
      document.addEventListener('touchend', function() {swipeStarted = false;});
    };
  }
  
  initialize() {
    const slider = this;
    
    slider.rebuildDOM();
    slider.setSwipeListener();
    if(this.settings.infinite) slider.createClones();
      
    slider.feedOffset = 0;
    slider.showSlide(0);
  }
}