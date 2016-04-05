

Zepto(function($){

    setTimeout( wrapTextareas, 500);
    $.get(chrome.extension.getURL ("/template.html"), function(response){
        $(document.body).append(response)
    });
    
    var lightTheme = 'sj-light';
    var darkTheme = 'sj-dark';
    var currentTheme = lightTheme; //default
    
    var errors = [];
    
    function setTheme(theme){
        currentTheme = theme;
        
        var overlay = $('.remodal-overlay');
        var cm = $('#simplejson_body .CodeMirror');
        
        if(currentTheme == lightTheme){
            overlay.addClass(lightTheme);
            overlay.removeClass(darkTheme);

            cm.addClass('cm-s-'+lightTheme);
            cm.removeClass('cm-s-'+darkTheme);

            cm.addClass('cm-s-mdn-like');
            cm.removeClass('cm-s-monokai');
            
            $('#simplejson_theme_light').addClass('activetheme');
            $('#simplejson_theme_dark').removeClass('activetheme');
        }
        
        if(currentTheme == darkTheme){
            overlay.removeClass(lightTheme);
            overlay.addClass(darkTheme);

            cm.removeClass('cm-s-'+lightTheme);
            cm.addClass('cm-s-'+darkTheme);

            cm.removeClass('cm-s-mdn-like');
            cm.addClass('cm-s-monokai');

            $('#simplejson_theme_light').removeClass('activetheme');
            $('#simplejson_theme_dark').addClass('activetheme');
        }
        
    }
    
    function wrapTextareas(){
        loadOptions();
        $.each($('textarea'), function(index, item){
            var text = $(item).val();
            if(text != null && text.length > 0){
             var m = text.charAt(0);
                if(m == "{"){
                    // Create our new link
                    $(item).after('<a class="simplejson" href="#">JSON detected</a>');
                    
                    // Enable modal editor on click
                    $(item).next('a.simplejson').on('click', function(event){
                        var options = {
                          "hashTracking": false  
                        };
                        var inst = $('[data-remodal-id=modal]').remodal(options);
                        inst.open();
                        $('.remodal-overlay').addClass(currentTheme);
                        $('#simplejson_errors').hide();
                        

                        $('#simplejson_textarea').val($(item).val());
                        
                        var cm_theme = (currentTheme == lightTheme) ? 'mdn-like' : 'monokai';
                        
                        var editor = CodeMirror.fromTextArea($('#simplejson_textarea')[0], {
                            lineNumbers: true,
                            matchBrackets: true,
                            autoCloseBrackets: true,
                            lineWrapping: true,
                            mode: "application/json",
                            foldGutter: true,
                            gutters: ["CodeMirror-lint-markers", "CodeMirror-foldgutter"],
                            theme: cm_theme + ' ' + currentTheme,
                            lint: {
                                getAnnotations: CodeMirror.lint.json,
                                onUpdateLinting: function(annotationsNotSorted, annotations, cm){
                                    errors = annotationsNotSorted;

                                    if(errors.length > 0) {
                                        $('#simplejson_errors').show();
                                        $('#simplejson_format').addClass('skdisable');
                                    } else {
                                        $('#simplejson_errors').hide();
                                        $('#simplejson_format').removeClass('skdisable');
                                    }
                                }
                            }
                        });
                        
                        // Button events
                        $('#simplejson_saveandclose').on('click', function(){
                            $(item).val(editor.getValue());
                            inst.close();
                        });
                        
                        $('#simplejson_cancel').on('click', function(){
                            inst.close();
                            
                        });
                        
                        $('#simplejson_format').on('click', function(){
                            if(errors.length == 0) {
                                editor.setValue(JSON.stringify(JSON.parse(editor.getValue()), null, 4));
                            }
                        });

                        
                        $('#simplejson_theme_light').on('click', function(){
                            if(currentTheme != lightTheme) {
                                setTheme(lightTheme);
                                saveOption('theme', lightTheme);
                            }
                            return false;
                        });

                        $('#simplejson_theme_dark').on('click', function(){
                            if(currentTheme != darkTheme) {
                                setTheme(darkTheme);
                                saveOption('theme', darkTheme);
                            }
                            return false;
                        });


                        $('#simplejson_errors').on('click', function(){
                            if(errors.length > 0){
                                var ln = errors[0].from.line;
                                var ch = errors[0].from.ch;
                                editor.scrollIntoView(ln,ch);
                            } else {
                                //nothing
                            }
                        });
                        
                        $(document).on('closed', '.remodal', function (e) {
                            editor.toTextArea();
                            $('.remodal-overlay').removeClass(lightTheme).removeClass(darkTheme);
                        });
                        
                        return false; // don't follow the URL
                    });
                }
            }
        });
    };
    
    
    function saveOption(key, val) {
       var option = {};
        option[key] = val;
        chrome.storage.sync.set(option, function() {
            // Do nothing
        });
    }

    function loadOptions() {
        // Use default value of lightTheme
        chrome.storage.sync.get({
            theme: lightTheme
        }, function(items) {
            setTheme(items.theme);
        });
    }
    
});






