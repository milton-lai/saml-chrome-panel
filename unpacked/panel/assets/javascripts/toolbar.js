SAMLChrome.factory('toolbar', function()
{

return {

    buttons: [],

    createButton: function(icon, name, input, callback)
    {
        this.buttons.push({
            icon: icon,
            name: name,
            input: input,
            callback: callback
        });
    },

    createToggleButton: function(icon, name, input, callback, selected)
    {
        this.buttons.push({
            icon: icon,
            name: name,
            input: input,
            toggle: true,
            callback: callback,
            selected: selected
        });
    },

    render: function()
    {
        var $html = $('<div class="toolbar"></div>');

        $.each(this.buttons, function(i, button)
        {
            var $button = $('<a class="icon" href="#" title="' + button.name + '"><i class="icon-' + button.icon + '"></i></a>');
            if (button.toggle === true) {
                $button.on('click', function() {
                    if ($button.hasClass("selected")) {
                        $button.removeClass("selected");
                    } else {
                        $button.addClass("selected");
                    }
                });
                if (button.selected === true) {
                    $button.addClass("selected");
                }
            }
            $button.on('click', button.callback);

            $html.append($button);

            if (button.input === true) {
                var $inputField = $('<input id="' + button.name + 'Input" type="file"/>');
                $html.append($inputField);
            }
        });

        return $html;
    }

};

});
