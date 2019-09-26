(() => {
    // public variables
    let lastScrollTop = window.pageYOffset || window.scrollTop;
    let isScrollingDown = false;


    function executeInQueue(_func, timeout) {
        if (!timeout) timeout = 10;

        setTimeout(_func, timeout);
    }

    function bindMenuEvents() {
        const $navbarBurgers = Array.prototype.slice.call(document.querySelectorAll('.navbar-burger'), 0);

        if ($navbarBurgers.length > 0) {

            $navbarBurgers.forEach(el => {
                el.addEventListener('click', () => {

                    const target = el.dataset.target;
                    const $target = document.getElementById(target);

                    el.classList.toggle('is-active');
                    $target.classList.toggle('is-active');

                });
            });
        }
    }

    function doTransparentHeaderScrolling() {
        const mainMenu = document.getElementsByClassName('navbar')[0];

        function shouldStickyNav() {
            const currentPos = window.scrollY;
            if (currentPos > 40) {
                mainMenu.classList.remove('is-transparent');
            } else {
                mainMenu.classList.add('is-transparent');
            }
        }

        window.addEventListener('scroll', shouldStickyNav);
    }

    function isInViewport(elem) {
        if (elem) {
            const scroll = window.scrollY || window.pageYOffset
            const boundsTop = elem.getBoundingClientRect().top + scroll

            const viewport = {
                top: scroll,
                bottom: scroll + window.innerHeight,
            }

            const bounds = {
                top: boundsTop,
                bottom: boundsTop + elem.clientHeight,
            }

            return (bounds.bottom >= viewport.top && bounds.bottom <= viewport.bottom) ||
                (bounds.top <= viewport.bottom && bounds.top >= viewport.top);
        }

        return false;
    }


    window.addEventListener("scroll", function () {
        let st = window.pageYOffset || document.documentElement.scrollTop;

        if (st > lastScrollTop) isScrollingDown = true;
        else isScrollingDown = false;
        lastScrollTop = st <= 0 ? 0 : st; // For Mobile or negative scrolling
    }, false);


    executeInQueue(bindMenuEvents(), 10);
    executeInQueue(doTransparentHeaderScrolling(), 20);
})()
