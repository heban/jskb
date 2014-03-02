/**
 * jsKB
 * @author Paweł Ochota
 */
var jsKB = (function () {
	var kb = null;
	var plane = null;
	var input = null;
	var clear = null;
	
	var shift = false;
	var alt = false;
	
	/**
	 * Sprawdzenie czy podany obiekt jest funkcją.
	 * @param {object} ob - obiekt do sprawdzenia
	 * @return {boolean} true lub false
	 */
	var _isFunction = function (ob) {
		if (typeof ob === 'function') {
			return true;
		}
		return false;
	};
	
	/**
	 * Dodawanie zdarzeń, polyfill dla wielu przeglądarek.
	 */
	var _addEvent = (function () {
		var _event;
		if (_isFunction(window.addEventListener)) {
			_event = function (elem, type, fn) {
				elem.addEventListener(type, fn, false);
			};
		} else if (_isFunction(window.attachEvent)) {
			_event = function (elem, type, fn) {
				elem.attachEvent('on' + type, fn);
			};
		} else {
			_event = function (elem, type, fn) {
				elem['on' + type] = fn;
			};
		}
		return _event;
	}());
	
	/**
	 * Usuwanie zdarzeń, polyfill dla wielu przeglądarek.
	 */
	var _removeEvent = (function () {
		var _event;
		if (_isFunction(window.removeEventListener)) {
			_event = function (elem, type, fn) {
				elem.removeEventListener(type, fn, false);
			};
		} else if (_isFunction(window.detachEvent)) {
			_event = function (elem, type, fn) {
				elem.detachEvent('on' + type, fn);
			};
		} else {
			_event = function (elem, type, fn) {
				elem['on' + type] = null;
			};
		}
		return _event;
	}());
	
	/**
	 * Mapa klawiszy.
	 * Tablice jedno-elementowe to klawisze specjalne, dwu-elementowe zawierają znak podstawowy oraz ten sam przy wciśniętym shifcie.
	 * Cztero-elementowe to odpowiednio znak podstawowy wraz z jego wersją dla shiftu, oraz podobna para z użyciem alta (klawisze specjalne).
	 */
	var layout = [
      ['`','~'],['1','!'],['2','@'],['3','#'],['4','$'],['5','%'],['6','^'],['7','&'],['8','*'],['9','('],['0',')'],['-','_'],['+','='],['BackSp'],
      ['Tab'],['q','Q'],['w','W'],['e','E','ę','Ę'],['r','R'],['t','T'],['y','Y'],['u','U'],['i','I'],['o','O','ó','Ó'],['p','P'],['[','{'],[']','}'],['\\','|'],
      ['CapsLk'],['a','A','ą','Ą'],['s','S','ś','Ś'],['d','D'],['f','F'],['g','G'],['h','H'],['j','J'],['k','K'],['l','L','ł','Ł'],[';',':'],['\'','"'],['Enter'],
      ['Shift'],['z','Z','ż','Ż'],['x','X','ź','Ź'],['c','C','ć','Ć'],['v','V'],['b','B'],['n','N','ń','Ń'],['m','M'],[',','<'],['.','>'],['/','?'],['Shift'],
      ['Space'],['Alt']
    ];
	
	/**
	 * Ukrywanie bądź pokazywanie klawiatury. 
	 * @param {object} _input - element html inputa
	 */
	var _toggleKb = function (_input) {
		input = _input;
		if (kb.style.display == 'none') {
	 		kb.style.display = 'block';
		} else {
			kb.style.display = 'none';
		}
	};
	
	/**
	 * Ukrywanie klawiatury.
	 */
	var _hideKb = function () {
		kb.style.display = 'none';
		input.blur();
	};
	
	/**
	 * Pokazywanie klawiatury.
	 * @param {object} _input - element html inputa
	 */
	var _showKb = function (_input) {
		input = _input;
		kb.style.display = 'block';
	};
	
	/**
	 * Czyszczenie pola tekstowego.
	 */
	var clearKb = function () {
		input.value = '';
		input.focus();
	};
	
	/**
	 * Zmiana styli klawiszy, gdy któryś z klawiszy specjalnych jest włączony.
	 * @param {string} name - nazwa klawisza specjalnego (alt_caps_on, caps_on, alt_on, caps_off)
	 */
	var modifyClass = function (name) {
		var divs = plane.getElementsByTagName('div');
		for (var i=0; i < divs.length; i++) {
			var elem = divs[i].getElementsByTagName('span');

			if (name == 'alt_caps_on') {
				if (elem[0] && elem[1] && elem[2] && elem[3]) {
					elem[0].style.display = 'none';
					elem[1].style.display = 'none';
					elem[2].style.display = 'none';
					elem[3].style.display = 'inline';
					elem[3].style.color = 'yellow';
				} else if (elem[0] && elem[1] && !elem[2] && !elem[3]) {
					elem[0].style.display = 'none';
					elem[1].style.display = 'inline';
				}
			}
			
			else if (name == 'caps_on') {
				if (elem[0] && elem[1] && elem[2] && elem[3]) {
					elem[0].style.display = 'none';
					elem[1].style.display = 'inline';
					elem[2].style.display = 'none';
					elem[3].style.display = 'none';
				} else if (elem[0] && elem[1] && !elem[2] && !elem[3]) {
					elem[0].style.display = 'none';
					elem[1].style.display = 'inline';
				}
			}
			
			else if (name == 'alt_on') {
				if (elem[0] && elem[1] && elem[2] && elem[3]) {
					elem[0].style.display = 'none';
					elem[1].style.display = 'none';
					elem[2].style.display = 'inline';
					elem[3].style.display = 'none';
					elem[2].style.color = 'yellow';
				} else if (elem[0] && elem[1] && !elem[2] && !elem[3]) {
					elem[0].style.display = 'inline';
					elem[1].style.display = 'none';
				}
			}
			
			else if (name == 'caps_off') {
				if (elem[0] && elem[1] && elem[2] && elem[3]) {
					elem[0].style.display = 'inline';
					elem[1].style.display = 'none';
					elem[2].style.display = 'none';
					elem[3].style.display = 'none';
				} else if (elem[0] && elem[1] && !elem[2] && !elem[3]) {
					elem[0].style.display = 'inline';
					elem[1].style.display = 'none';
				}
			}
		}
	};
	
	/**
	 * Generowanie klawiszy na podstawie tablicy layout, 
	 * ustawianie klas dla klawiszy specjalnych, podłączanie zdarzeń zmiany kursora (do przerobienia, to niewydajne).
	 */
	var generateKeys = function () {
		for (var i=0; i < layout.length; i++) {
		  var key = document.createElement('div');
		  
		  key.className = 'KB_key';
		  var specialKey = true;
		  
		  if (layout[i][0] == 'BackSp') {
		  	key.className = 'KB_backs';
		  } else if (layout[i][0] == 'Tab') {
		  	key.className = 'KB_tab';
		  } else if (layout[i][0] == 'Enter') {
		  	key.className = 'KB_enter';
		  } else if (layout[i][0] == 'CapsLk') {
		  	key.className = 'KB_caps';
		  } else if (layout[i][0] == 'Shift') {
		  	key.className = 'KB_shift';
		  } else if (layout[i][0] == 'Space') {
		  	key.className = 'KB_space';
		  } else if (layout[i][0] == 'Alt') {
		  	key.className = 'KB_alt';
		  } else {
		  	specialKey = false;
		  }
		  
		  var keya = document.createElement('span');
		  
		  if (!specialKey) {
		  	keya.className = 'caps_off';
		  	keya.style.display = 'inline';
		  }
		  
		  keya.appendChild(document.createTextNode(layout[i][0]));
		  key.appendChild(keya);
		  
		  addSubKey(key,layout[i][1],'caps_on');
		  addSubKey(key,layout[i][2],'alt_on');
		  addSubKey(key,layout[i][3],'alt_caps_on');
		  
		  key.onmouseover = function () { 
		  	changeCursor(this);
		  }
		  key.onmouseout = function () { 
		  	changeCursor(this);
		  }
		  
		  plane.appendChild(key);
		}
		
		var clearb = document.createElement('div');
		clearb.className = 'clearb';
		plane.appendChild(clearb);
	};
	
	/**
	 * Dodaje zdarzenie click dla klawiszy na klawiaturze. (Do zmiany, lepsza będzie delegacja).
	 */
	var addEvents = function () {
		var divs = plane.getElementsByTagName('div');
		for (var i=0; i < layout.length; i++) {
		  	divs[i].onclick = closureTemp(divs[i],layout[i]);
		}
		clear.onclick = clearKb;
	};
	
	/**
	 * Funkcja pomocnicza przy dodawaniu zdarzeń klawiszy w pętli.
	 */
	var closureTemp = function (elem,tab) {
		return function() {
			pressKey(elem,tab);
		}
	};
	
	/**
	 * Zmienia kursor myszy przy wskazaniu klawisza.
	 */
	var changeCursor = function (elem) {
		if (elem.style.cursor == 'pointer') {
			elem.style.cursor = 'default';
		} else {
			elem.style.cursor = 'pointer';
		}
	};
	
	/**
	 * Dodaje dodatkowe elementy html do klawiszy.
	 */
	var addSubKey = function (key,elemArray,_class) {
		if (typeof elemArray !== 'undefined') {
		  var keyc = document.createElement('span');
		  keyc.className = _class;
		  keyc.style.display = 'none';
		  keyc.appendChild(document.createTextNode(elemArray));
		  key.appendChild(keyc);
		}
	};
	
	/**
	 * Odświeża klasy dla klawiszy klawiatury na podstawie ustawionych flag.
	 */
	var refreshClass = function () {
		if (shift && alt) {
			modifyClass('alt_caps_on');
		} else if (shift && !alt) {
			modifyClass('caps_on');
		} else if (!shift && alt) {
			modifyClass('alt_on');
		} else {
			modifyClass('caps_off');
		}
	};
	
	/**
	 * Emulacja zachowania klawisza backspace.
	 */
	var backspace = function () {
		if (document.selection && (input.type != 'text')) {
			input.focus();
			var sel = document.selection.createRange();
			if (sel.text.length > 0) {
				sel.text = '';
			} else {
				sel.moveStart('character',-1);
				sel.text = '';
			}
			sel.select();
		} else if (input.selectionStart || input.selectionStart == '0') {
			var startPos = input.selectionStart;
			var endPos = input.selectionEnd;
			input.value = input.value.substring(0,startPos-1) + input.value.substring(endPos,input.value.length);
			input.selectionStart = startPos-1;
			input.selectionEnd = startPos-1;
			input.focus();
		} else {
			input.value = input.value.substring(0,(input.value.length-1));
			input.focus();
		}
	};
	
	/**
	 * Wprowadza tekst do pola tekstowego.
	 * @param {string} textinp - tekst do wprowadzenia.
	 */
	var insertText = function (textinp) {
		if (document.selection && (input.type != 'text')) {
			input.focus();
			var sel = document.selection.createRange();
			sel.text = textinp;
			input.focus();
		} else if (input.selectionStart || input.selectionStart == '0') {
			var startPos = input.selectionStart;
			var endPos = input.selectionEnd;
			input.value = input.value.substring(0,startPos) + textinp + input.value.substring(endPos,input.value.length);
			input.selectionStart = startPos + textinp.length;
			input.selectionEnd = startPos + textinp.length;
			input.focus();
		} else {
			input.value += textinp;
			input.focus();
		}
	};

	/**
	 * Funkcja uruchamiana w momencie kliknięcia w dany klawisz na klawiaturze.
	 * Sprawdza czy ma do czynienia z klawiszem specjalnym lub normalnym, w przypadku
	 * tego drugiego uruchamia funkcję do wprowadzania tekstu.
	 */
	var pressKey = function (element,tab) {
		var chars = '';
		if ((element.className == 'KB_caps') || (element.className == 'KB_shift')) {
			shift = (shift === true) ? false : true;
			refreshClass();
		} else if (element.className == 'KB_alt') {
			alt = (alt === true) ? false : true;
			refreshClass();
		} else if (element.className == 'KB_enter') {
			if (document.selection) {
				chars = '\r\n';
			} else {
				chars = '\n';
			}
		} else if (element.className == 'KB_tab') {
			chars = '\t';
		} else if (element.className == 'KB_space') {
			chars = ' ';
		} else if (element.className == 'KB_backs'){
			chars = '';
			backspace();
		} else if (element.className == 'KB_key') {
			var temp = element.getElementsByTagName('span');
			for (var i=0; i < temp.length; i++) {
				if ((temp[i] != '') && (typeof temp[i] !== 'undefined') && (temp[i].style.display != 'none')) {
					if (temp[i].innerHTML == '&amp;') {
						chars = temp[i].innerHTML.replace(/\&amp;/,'&');
					} else if (temp[i].innerHTML == '&lt;') {
						chars = temp[i].innerHTML.replace(/\&lt;/,'<');
					} else if (temp[i].innerHTML == '&gt;') {
						chars = temp[i].innerHTML.replace(/\&gt;/,'>');
					} else {
						chars = temp[i].innerHTML;
					}
				}
			}
		}

		if (chars != '') {
			insertText(chars);
		}
	};
	
	/**
	 * Funkcja generująca niezmienne elementy klawiatury (główne kontenery, przycisk clear itp.).
	 */
	var generateKB = function () {
		kb = document.createElement('div');
		kb.style.display = "none";
		kb.setAttribute('id','jsKB');
		document.body.appendChild(kb);
			
		plane = document.createElement('div');
		plane.setAttribute('id','KB_plane');
		plane.style.width = kb.style.width;
		plane.style.height = kb.style.height;
		kb.appendChild(plane);
			
		var close = document.createElement('span');
		close.setAttribute('id','Close_btn');
		close.appendChild(document.createTextNode('x'));
		plane.appendChild(close);
		close.onclick = _hideKb;
			
		clear = document.createElement('span');
		clear.setAttribute('id','Clear_btn');
		clear.appendChild(document.createTextNode('clear'));
		plane.appendChild(clear);
			
		var info = document.createElement('span');
		info.setAttribute('id','Info_btn');
		info.appendChild(document.createTextNode('jsKB'));
		plane.appendChild(info);
	};
	
	/**
	 * Funkcja generująca klawiaturę (jeden element dla wszystkich instancji).
	 */
	var keyboard = function () {
		if (!document.getElementById('jsKB')) {
			generateKB();
			generateKeys();
		} else {
			kb = document.getElementById('jsKB');
			plane = document.getElementById('KB_plane');
			clear = document.getElementById('Clear_btn');
		}	
	};
	
	/**
	 * Konstruktor instancji klawiatury, wiąże input ze zdarzeniami.
	 * @param {object} _input - string lub element html, input/textarea dla klawiatury
	 * @param {object} _button - string lub element html, opcjonalny element do wywoływania klawiatury
	 */
	var _jsKB = function (_input, _button) {
		if (typeof _input !== 'string') {
			var input = _input;
		} else {
			var input = document.getElementById(_input);
		}
		
		if (_button) {
			if (typeof _button !== 'string') {
				var button = _button;
			} else {
				var button = document.getElementById(_button);
			}
			_removeEvent(button, "click", function () {_toggleKb(input)});
			_addEvent(button, "click", function () {_toggleKb(input)});
		} else {
			_removeEvent(input, "focus", function () {_showKb(input)});
			_addEvent(input, "focus", function () {_showKb(input)});
		}
		
		addEvents();
	};
	
	/**
	 * Metody użyteczne dla wszystkich instancji
	 */
	_jsKB.prototype = {
		toggleKeyBoard : _toggleKb,
		showKeyBoard : _showKb,
		hideKeyBoard : _hideKb
	};
	
	/**
	 * Funkcja główna, łącząca input z pozostałymi mechanizmami.
	 * @return {object} - instancja klawiatury (do przyszłych zastosowań)
	 */
	return function (_input,_button) {
		keyboard();
		return new _jsKB(_input, _button);
	};
}());