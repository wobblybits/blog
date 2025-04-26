<!-- @format -->

This is the code for [wobblybits.blog](https://wobblybits.blog), including the blogging framework as well as the code for the individual posts.

## Client-Side Micro-Blogging Framework

The blogging framework is pretty bare bones (for now?), but it allows for new posts to be created quickly and runs entirely on the client-side: no database, no CRM. It is not the most efficient, but it is low overhead, and since does not load any external images or libraries, the files are generally very tiny to begin with.

Each post is self-contained in a single `.js` file under the pages folder. Creating a new post is as simple as adding the next appropriately named js file.

The two main site-wide `.js` files are `js/layout.js` which handles fetching and displaying the posts and `js/onebit.js` which contains the basic definitions for the 1-bit BMP dataURI canvas that each post uses. Note: The canvas dimensions always need to be a multiple of 32 pixels wide unless you want to write the extra code for the dataURI to handle zero-padding rows.

Since everything on the blog is client-side, all of this code is already easily available by going to the site itself and using the browser's inspector, but I am making it available here on Github as well.

## Why create a one-bit canvas?

Well, to start, there's something nice about the simplicity of designs that only use two colors. The native HTML canvas element can produce black-and-white images, that is true, but it doesn't constrain you to, and you end up using 32 bits to store a single 1-bit pixel. I wanted to build something more suited to the purpose, and I'm having fun.

## Attributions

The site uses the [TI Pro Font]("https://int10h.org/oldschool-pc-fonts/fontlist/?4#ti") from [Old School PC Fonts](https://int10h.org/oldschool-pc-fonts/fontlist/) and an icon font from [Pixel Icon Library](https://pixeliconlibrary.com) by [HackerNoon](https://hackernoon.com) which I have not included in the repo but which can be downloaded separately at the respective links.
