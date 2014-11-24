(function(root, factory) {
if(typeof exports === 'object') {
module.exports = factory();
} else if(typeof define === 'function' && define.amd) {
define(['module/widget/1.0.2/widget'], factory);
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
			_elementOffset: 0,
			_itemsPosition: []
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

			_elementOffset = this.set('_elementOffset',this.$element.offset()[directionMap[attrs.direction]]);
			_itemsPosition = this.set('_itemsPosition',getPositionList($('.'+itemClass, this.$element), attrs.direction));
		},
		_bindEvent: function(){
			var me = this,
				$element = this.$element,
				direction = this.get('direction'),
				position,
				orgPosition,
				index;

			$element.on('touchstart', function(e){
				var _elementOffset = me.get('_elementOffset'),
					_itemsPosition = me.get('_itemsPosition');

				e.preventDefault();
				e.stopPropagation();

				position = e.touches[0]['page'+direction] - _elementOffset;
				index = getIndex(position, _itemsPosition);

				me.trigger('jump', [{index: index, position: position}]);
			}).on('touchmove', function(e){
				var _elementOffset = me.get('_elementOffset'),
					_itemsPosition = me.get('_itemsPosition');

				e.preventDefault();
				e.stopPropagation();

				var touch = e.touches[0];

				orgPosition = position;
				position = touch['page'+direction] - _elementOffset;

				var i = getIndex(position, _itemsPosition, index, orgPosition);

				if (i != index) {
					index = i;
					me.trigger('jump', [{index: index, position: position}]);
				}

			}).on('touchend', function(e){
				me.trigger('jumpend', [{index: index, position: position}]);
			});
		}
	});

	/*getIndex(position, _itemsPosition, index, orgPosition);*/
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