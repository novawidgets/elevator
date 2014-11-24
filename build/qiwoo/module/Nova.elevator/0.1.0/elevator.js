(function(root, factory) {
if(typeof exports === 'object') {
module.exports = factory();
} else if(typeof define === 'function' && define.amd) {
define(['module/widget/1.0.1/widget'], factory);
} else {
root['Elevator'] = factory();
}
})(this, function(Widget) {
Widget = Widget || this.Widget;


	var directionMap = {
			X: 'left',
			Y: 'top'
		};

	var Elevator = Widget.extend({
		attrs: {
			direction: 'Y',
			classNames: {
				item: 'elevator-item'
			},
			selecters: {
				target: '.elevator-target'
			},
			targetContainer: document,
			template: '<ul>',
			elementOffset: 0,
			itemsPosition: []
		},
		setup: function(){
			this._bindEvent();
		},
		refresh: function(){
			var attrs = this.get();
			var itemClass = attrs.classNames.item;
			var targetList = $(attrs.selecters.target, attrs.targetContainer);

			var itemHtmlList = [];

			targetList.each(function(index, item){
				itemHtmlList.push('<li class="'+itemClass+'" data-index="'+index+'">'+$(item).data('key')+'</li>');
			});

			this.$element.html(itemHtmlList.join(''));

			elementOffset = this.set('elementOffset',this.$element.offset()[directionMap[attrs.direction]]);
			itemsPosition = this.set('itemsPosition',getPositionList($('.'+itemClass, this.$element), attrs.direction));
		},
		_bindEvent: function(){
			var me = this,
				$element = this.$element,
				direction = this.get('direction'),
				position,
				orgPosition,
				index;

			$element.on('touchstart', function(e){
				var elementOffset = me.get('elementOffset'),
					itemsPosition = me.get('itemsPosition');

				e.preventDefault();
				e.stopPropagation();

				position = e.touches[0]['page'+direction] - elementOffset;
				index = getIndex(position, itemsPosition);

				me.trigger('jump', [{index: index, position: position}]);
			}).on('touchmove', function(e){
				var elementOffset = me.get('elementOffset'),
					itemsPosition = me.get('itemsPosition');

				e.preventDefault();
				e.stopPropagation();

				var touch = e.touches[0];

				orgPosition = position;
				position = touch['page'+direction] - elementOffset;

				var i = getIndex(position, itemsPosition, index, orgPosition);

				if (i != index) {
					index = i;
					me.trigger('jump', [{index: index, position: position}]);
				}

			}).on('touchend', function(e){
				me.trigger('jumpend', [{index: index, position: position}]);
			});
		}
	});

	/*getIndex(position, itemsPosition, index, orgPosition);*/
	function getIndex(p, pl, startIndex, op){
		if(pl.length == 0){ return null; }

		var i = startIndex;

		if(startIndex === undefined) {

			if (p<pl[0]) { return 0; }

			for (i = 0; i < pl.length-1; i++) {
				if(pl[i] <= p && pl[i+1] > p){
					return i;
				}
			}

			return pl.length-1;
		} else {
			op === undefined && (op = p);
			if (p-op>0) {
				if (p<pl[0]) { return 0; }

				for (; i < pl.length-1; i++) {
					if(pl[i] <= p && pl[i+1] > p){
						return i;
					}
				}

				return pl.length-1;
			} else if(p-op<0) {
				if(pl[i] <= p){ return i; }

				for (; i > 0; i--) {
					if(pl[i] > p && pl[i-1] <= p){
						return i-1;
					}
				}

				return 0;
			}
		}

		return i;
	}

	function getPositionList(els, direction){
		return els.map(function(index,item){
			return $(item).position()[directionMap[direction]];
		});
	}

	return Elevator;
});