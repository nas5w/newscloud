import {inject} from 'aurelia-framework';
import {HttpClient} from 'aurelia-http-client';
import * as d3 from 'd3';
import * as cloud from 'd3-cloud';
import * as sw from 'stopword';

@inject(HttpClient)
export class App {

  constructor(http) {

		this.http = http.configure(x => {
		    x.withBaseUrl('http://localhost:3000');
		  });

  }

  attached() {
  	this.fetchHeadlines();  	
  }

  fetchHeadlines() {
  	this.feed = [];
  	this.words = {};
  	this.selected = '';
		this.http.get('/')	
		.then(feed => {
			this.feed = JSON.parse(feed.response);
			this.currentAsOf = new Date();
			this.parseWords();
		});
  }

  parseWords() {

  	this.feed.forEach(item => {
  		item.words = [];
  		let punctuationless = item.title.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}?=\-_`'~()]/g,'');
  		let words = sw.removeStopwords(punctuationless.split(' '));
  		words.forEach(word => {
  			// Skip any pure integers
  			if (Number(word) != word) {
	  			item.words.push(word);
	  			if (this.words[word]) {
	  				this.words[word]++;
	  			} else {
	  				this.words[word] = 1;
	  			}  				
  			}
  		});
  	});

    for (const prop in this.words) {
      if (this.words.hasOwnProperty(prop)) {
        if (this.words[prop] == 1) {
          delete this.words[prop];
        }
      } 
    }    

  	this.wordcloud();
  }

  wordcloud() {

		var svg_location = "#chart";
    var width = $('#container').width();
    var height = 500;
		var fill = d3.scaleOrdinal(d3.schemeCategory20);
		var word_entries = d3.entries(this.words);
		var self = this;

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
    	$('svg').remove();
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
          .text(function(d) { return d.key; })
          .attr('cursor', 'pointer')
          .on('click', d => {
          	self.selected = ` (filter: ${d.text})`;

            $('.headlines').each((key, headline) => {
              if ($(headline).data('words').split(',').filter(x => { return x === d.text }).length > 0) {
                $(headline).css('display', 'table-row');
              } else {
                $(headline).css('display', 'none');
              }

            });

			    })
			    .on('mouseover', d => {
			    	$('text').each((item, value) => {
			    		if (value.innerHTML === d.text) {
			    			$(value).stop().animate({
			    				opacity: 1
			    			}, 500); 
			    		}	else {
			    			$(value).stop().animate({
			    				opacity: 0.2
			    			}, 500); 
			    		}
			    	});
			    })
			    .on('mouseout', d => {
	    			$('text').stop().animate({
	    				opacity: 1
	    			}, 500); 
			    });

    }

    cloud.default().stop();

  }

  clearFilter() {
  	this.selected = '';
  	let all = document.querySelectorAll('.headlines');
  	for (let i = 0; i < all.length; i++) {
  		all[i].style.display = 'table-row';
  	}
  }

}
