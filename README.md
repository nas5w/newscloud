# Newscloud App
This app pulls from a Google news RSS feed on a periodic basis, stores the headlines in a database, and presents wordclouds of the most frequently-used words to the end user via a web interface. The app consists of a MongoDB / Node.js backend and an Aurelia.js frontend.

## Running the App

### Prerequisites
This app requires you have MongoDB installed first!

### Installing
Clone down the app:
`git clone https://github.com/nas5w/newscloud.git`
Install node server packages and star the server
~~~~
cd newscloud/server
npm i
node .	
~~~~
Install the Aurelia CLI if you don't have it
`npm i -g aurelia-cli`
Install node client packages and run the Aurelia app
~~~~
cd ../client
npm i
au run
~~~~
Note that you won't see any wordclouds for a few minutes as the server will take a few minutes to accumulate headlines. See the `server/index.js` file for how periodic headline retrieval works.

## Contributing
Please feel free to submit a pull request!

## License
The MIT License (MIT)
=====================

Copyright © `<year>`

Permission is hereby granted, free of charge, to any person
obtaining a copy of this software and associated documentation
files (the "Software"), to deal in the Software without
restriction, including without limitation the rights to use,
copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.
