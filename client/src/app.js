import {inject} from 'aurelia-framework';
import {HttpClient} from 'aurelia-http-client';
import * as d3 from 'd3';
import * as cloud from 'd3-cloud';
import * as sw from 'stopword';

@inject(HttpClient)
export class App {

  constructor(http) {

  	this.feed = [];
  	this.words = {};

		this.http = http.configure(x => {
		    x.withBaseUrl('http://localhost:3000');
		  });		
		this.http.get('/')	
		.then(feed => {
			this.feed = JSON.parse(feed.response);
			this.parseWords(this.feed);
		});
  }

  parseWords(feed) {

  	feed.forEach(item => {
  		let punctuationless = item.title.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`'~()]/g,'');
  		let words = sw.removeStopwords(punctuationless.split(' '));
  		words.forEach(word => {
  			if (this.words[word]) {
  				this.words[word]++;
  			} else {
  				this.words[word] = 1;
  			}
  		});
  	});
  	console.log(this.words);
  	this.wordcloud();
  }

  wordcloud() {

		var svg_location = "#chart";
    var width = 900;
    var height = 500;
		var fill = d3.scaleOrdinal(d3.schemeCategory20);
		var word_entries = d3.entries(this.words);

		var xScale = d3.scaleLinear()
      .domain([0, d3.max(word_entries, function(d) {
      		return d.value;
      	})
      ])
      .range([10,100]);

		var layout = cloud.default().size([width, height])
      .timeInterval(20)
      .words(word_entries)
      .fontSize(function(d) { return xScale(+d.value); })
      .text(function(d) { return d.key; })
      .rotate(function() { return ~~(Math.random() * 2) * 90; })
      .font('Impact')
      .on("end", draw)
      .start();

    function draw(words) {
    	console.log(words);
      d3.select(svg_location).append("svg")
          .attr("width", width)
          .attr("height", height)
        .append("g")
          .attr("transform", "translate(" + [width >> 1, height >> 1] + ")")
        .selectAll("text")
          .data(words)
        .enter().append("text")
          .style("font-size", function(d) { return xScale(d.value) + "px"; })
          .style("font-family", "Impact")
          .style("fill", function(d, i) { return fill(i); })
          .attr("text-anchor", "middle")
          .attr("transform", function(d) {
            return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
          })
          .text(function(d) { return d.key; });
    }

    cloud.default().stop();

  }

}
