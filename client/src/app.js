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

    this.recurrence = 1;
    // Refresh timer is in seconds
    this.refreshTimer = 30;
    this.refreshTimeLeft = this.refreshTimer;
  }

  attached() {
  	this.fetchHeadlines(); 
    $('#headlines').height($(window).height());
    $('#container').height($(window).height());


    setInterval(() => { 
      this.fetchHeadlines();
      this.refreshTimeLeft = this.refreshTimer;
    }, this.refreshTimer * 1000);
    
    setInterval(() => { 
      this.refreshTimeLeft--;
    }, 1000);

  }

  fetchHeadlines() {
    $('#time-bar').stop();
    $('#time-bar').css('width', '1px');
    $('#time-bar').animate({
      width: `${$(window).width()}px`
    }, this.refreshTimer * 1000, 'linear');

    if(this.feed) {
      this.feedLength = this.feed.length;
    } else {
      this.feedLength = 0;
    }

  	this.http.get('/')	
		.then(feed => {
			this.currentAsOf = new Date();
      if (this.feedLength !== JSON.parse(feed.response).length) {
        this.feed = JSON.parse(feed.response);
        this.selected = '';
        this.parseWords();
      }

		});
  }

  parseWords() {

    this.words = {};

  	this.feed.forEach(item => {
  		item.words = [];
  		let punctuationless = item.title.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}?=\-—_`'~()]/g,'');
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
        if (this.words[prop] < this.recurrence) {
          delete this.words[prop];
        }
      } 
    }    

  	this.wordcloud();
  }

  wordcloud() {

		var svg_location = '#chart';
    var width = $('.col-md-9').width() * 0.9;
    var height = ($(window).height() - $('#title').height() - $('#controls').height() - 50) * 0.9;
    $('#chart').css('margin-left', $('.col-md-9').width() * 0.05);
    $('#chart').css('margin-top', ($(window).height() - $('#title').height() - $('#controls').height() - 50) * 0.05);
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
      .on('end', draw)
      .start();

    function draw(words) {
    	$('svg').remove();
      d3.select(svg_location).append('svg')
          .attr('width', width)
          .attr('height', height)
        .append('g')
          .attr('transform', `translate(${[width >> 1, height >> 1]})`)
        .selectAll('text')
          .data(words)
        .enter().append('text')
          .style('font-size', function(d) { return `${xScale(d.value)}px`; })
          .style('font-family', 'Impact')
          .style('fill', function(d, i) { return fill(i); })
          .attr('text-anchor', 'middle')
          .attr('transform', function(d) {
            return `translate(${[d.x, d.y]})rotate(${d.rotate})`;
          })
          .text(function(d) { return d.key; })
          .attr('cursor', 'pointer')
          .on('click', d => {
          	self.selected = d.text;

            $('.headlines').each((key, headline) => {
              if ($(headline).data('words').split(',').filter(x => { return x === d.text }).length > 0) {
                $(headline).css('display', 'list-item');
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
  		all[i].style.display = 'list-item';
  	}
  }

}
