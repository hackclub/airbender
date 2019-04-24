# Airbender

![](https://pmcvariety.files.wordpress.com/2018/09/last-airbender.jpg)

Airbender is a continually running Node bot that takes programmatic actions in our Airtable databases, like integrating our shipment database with Shippo for creating shipping labels.

## Setup

The standards...

    $ git clone https://github.com/hackclub/airbender

Create a file in the cloned repo called `.env` and fill with the following:

```
AIRTABLE_KEY=REPLACEME
AIRTABLE_SHIPPING_BASE=REPLACEME
AIRTABLE_HARDWARE_DONATIONS_BASE=REPLACEME
AIRTABLE_FORM_SUBMISSIONS_BASE=REPLACEME

SHIPPO_KEY=REPLACEME
```

Install dependencies:

    $ npm install

And then run (only works in root of repo)!

    $ ./bin/airbender

## Deployment

Our app is currently deployed on Heroku under `airbender-hackclub`.

CI has not been set up yet for autodeployment from master. I (Zach) am curretly manually deploying from my machine.

## License

**The MIT License (MIT)**

Copyright © 2019 The Hack Foundation

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
