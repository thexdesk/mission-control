# r/SpaceX Mission Control

JavaScript ![documentation %](https://r-spacex.github.io/image/badge.svg)

## Servers

Mission Control is currently running on two servers: production and testing. The production server is located at [spacex-mission-control.herokuapp.com](https://spacex-mission-control.herokuapp.com), while the testing server is at [spx-mc-testing.herokuapp.com](https://spx-mc-testing.herokuapp.com). The production server should be stable and (mostly) bug-free, while the testing server may be unstable and (though unlikely) possible not functional. However, the testing server will likely be a step or two ahead of production, feature-wise.

## Installation

To setup [Mission Control](https://github.com/r-spacex/mission-control/), run the following commands. This will copy the repo locally and install the requisite packages. You may need to enter your password to authenticate the installation.

```bash
git clone git@github.com:r-spacex/mission-control.git
cd mission-control
./install
```

## Environment variables

The following environment variables are expected to be set for ruby.

| variable | example value | purpose |
| --- | --- | --- |
| CLIENT_ID | `LFE3XY450n6cai` | authenticates with reddit API |
| RACK_ENV | `production` | allows external connections (disabled by default, use `production` to enable) |
| REDIRECT_URI | `https://example.com/auth/callback` | callback from reddit authentication |
| SECRET | `8BhhhFSSBZ9sYg6NZxQS7gsrnaq` | authenticates with reddit API |
| SUBREDDIT | `spacex` | subreddit to post to |

## Running the server

To run the server, go to the repo directory and run `ruby src/endpoints.rb`.

## Development

### gulp

To run [gulp](https://github.com/r-spacex/mission-control/blob/master/gulpfile.js), just use the `gulp` command, no arguments necessary. This will automatically do all of the following.

| task name | what it does |
| --- | --- |
| postcss | transpile and minify all CSS |
| rollup-modules | combine all modules into a single file |
| rollup-packages | combine all packages into a single file |
| js-modules | minify js modules |
| watch | watch directories, calls the proper task when needed |

### CSS

Mission Control uses [PostCSS](http://postcss.org/), which is located in the [`/src/public/css`](https://github.com/r-spacex/mission-control/tree/master/src/public/css) directory. All CSS should be split into relevant files, and pulled together in [`all.pcss`](https://github.com/r-spacex/mission-control/tree/master/src/public/css/all.pcss). Documentation for the plugins is avilable in [CSS.md](https://github.com/r-spacex/mission-control/tree/master/CSS.md).

### JavaScript

#### Packages

All packages are located in the [`/src/public/js/packages`](https://github.com/r-spacex/mission-control/tree/master/src/public/js/packages) directory. Mission Control currently uses the following packages.

- [annyang](https://github.com/TalAter/annyang)
- [Dialog polyfill](https://github.com/GoogleChrome/dialog-polyfill)
- [SimpleMDE](https://github.com/sparksuite/simplemde-markdown-editor)
- [Sortable](https://github.com/RubaXa/Sortable)

#### Modules
See [full documentation](https://r-spacex.github.io/mission-control).

## Browser support

### Confirmed working
![Chrome 59+](https://img.shields.io/badge/Chrome-59+-green.svg)
![Firefox 52+](https://img.shields.io/badge/Firefox-52+-green.svg)
![Opera 46+](https://img.shields.io/badge/Opera-46+-green.svg)
![Safari 10.1+](https://img.shields.io/badge/Safari-10.1+-green.svg)

### Not checked
![Edge 16](https://img.shields.io/badge/Edge-16-lightgrey.svg)
![Chrome 58-](https://img.shields.io/badge/Chrome-58---lightgrey.svg)
![Firefox 51-](https://img.shields.io/badge/Firefox-51---lightgrey.svg)
![Opera 45-](https://img.shields.io/badge/Opera-45---lightgrey.svg)

### Confirmed broken
![Edge 15](https://img.shields.io/badge/Edge-15-red.svg)
![Safari 10.0](https://img.shields.io/badge/Safari-10.0-red.svg)

## License

[MIT license](https://github.com/r-spacex/mission-control/blob/master/LICENSE)

## Contributing

Feel free to [fork](https://github.com/r-spacex/mission-control/fork) and [create a PR](https://github.com/r-spacex/mission-control/compare). Creating a PR implies you are releasing the code under the [MIT license](https://github.com/r-spacex/mission-control/blob/master/LICENSE).

Please verify everything still works after you modify code ─ I haven't bothered to set up headless testing in Chrome or Firefox.
