var gemini = require('gemini');

gemini.suite('SBIS3.CONTROLS.MenuIcon Online', function () {

	gemini.suite('with_icon16', function (test) {

        test.setUrl('/regression_menu_icon_online.html').setCaptureElements('.capture')

            .before(function (actions, find) {
                actions.waitForElementToShow('[name="MenuIcon 1"]', 40000);
                this.button = find('[name="MenuIcon 1"]');
				actions.waitForElementToShow('[sbisname="TextBox 1"]', 40000);
                this.text_box = find('[sbisname="TextBox 1"] input');
				this.item_1 = find('[data-id="1"]');
            })

            .capture('plain', function (actions) {
                actions.click(this.text_box);
            })

            .capture('hovered', function (actions) {
                actions.mouseMove(this.button);
            })
			
			.capture('menu_opened', function (actions) {
                actions.click(this.button);
				actions.waitForElementToShow('[data-id="1"]', 1000);
				actions.waitForElementToShow('[data-id="2"]', 1000);
				actions.wait(1000);
            })
			
			.capture('hovered_item', function (actions) {
                actions.mouseMove(this.item_1);
            })
    });

	gemini.suite('right_side', function (test) {

        test.setUrl('/regression_menu_icon_online.html').skip('firefox').setCaptureElements('html')

            .before(function (actions, find) {
                actions.waitForElementToShow('[name="MenuIcon 1"]', 40000);
                this.button = find('[name="MenuIcon 1"]');
				actions.waitForElementToShow('[sbisname="TextBox 1"]', 40000);
                this.text_box = find('[sbisname="TextBox 1"] input');
				this.item_1 = find('[data-id="1"]');
            })

            .capture('plain', function (actions) {
                actions.executeJS(function (window) {
					var offset = document.body.clientWidth - $('[sbisname="MenuIcon 1"]').width() - 20
                    window.$('[sbisname="MenuIcon 1"]').offset({'left': offset, 'top': 20});
                });
				actions.mouseMove(this.text_box);
            })

            .capture('hovered', function (actions) {
                actions.mouseMove(this.button);
            })
			
			.capture('menu_opened', function (actions) {
                actions.click(this.button);
				actions.waitForElementToShow('[data-id="1"]', 1000);
				actions.waitForElementToShow('[data-id="2"]', 1000);
				actions.wait(1000);
            })
			
			.capture('hovered_item', function (actions) {
                actions.mouseMove(this.item_1);
            })
    });
	
	gemini.suite('bottom_side', function (test) {

        test.setUrl('/regression_menu_icon_online.html').skip('firefox').setCaptureElements('html')

            .before(function (actions, find) {
                actions.waitForElementToShow('[name="MenuIcon 1"]', 40000);
                this.button = find('[name="MenuIcon 1"]');
				actions.waitForElementToShow('[sbisname="TextBox 1"]', 40000);
                this.text_box = find('[sbisname="TextBox 1"] input');
				this.item_1 = find('[data-id="1"]');
            })

            .capture('plain', function (actions) {
                actions.executeJS(function (window) {
                    window.$('[sbisname="MenuIcon 1"]').offset({'left': 20, 'top': 850});
                });
				actions.mouseMove(this.text_box);
            })

            .capture('hovered', function (actions) {
                actions.mouseMove(this.button);
            })
			
			.capture('menu_opened', function (actions) {
                actions.click(this.button);
				actions.waitForElementToShow('[data-id="1"]', 1000);
				actions.waitForElementToShow('[data-id="2"]', 1000);
				actions.wait(1000);
            })
			
			.capture('hovered_item', function (actions) {
                actions.mouseMove(this.item_1);
            })
    });
	
	gemini.suite('bottom_right_side', function (test) {

        test.setUrl('/regression_menu_icon_online.html').skip('firefox').setCaptureElements('html')

            .before(function (actions, find) {
                actions.waitForElementToShow('[name="MenuIcon 1"]', 40000);
                this.button = find('[name="MenuIcon 1"]');
				actions.waitForElementToShow('[sbisname="TextBox 1"]', 40000);
                this.text_box = find('[sbisname="TextBox 1"] input');
				this.item_1 = find('[data-id="1"]');
            })

            .capture('plain', function (actions) {
                actions.executeJS(function (window) {
					var offset = document.body.clientWidth - $('[sbisname="MenuIcon 1"]').width() - 20
                    window.$('[sbisname="MenuIcon 1"]').offset({'left': offset, 'top': 850});
                });
				actions.mouseMove(this.text_box);
            })

            .capture('hovered', function (actions) {
                actions.mouseMove(this.button);
            })
			
			.capture('menu_opened', function (actions) {
                actions.click(this.button);
				actions.waitForElementToShow('[data-id="1"]', 1000);
				actions.waitForElementToShow('[data-id="2"]', 1000);
				actions.wait(1000);
            })
			
			.capture('hovered_item', function (actions) {
                actions.mouseMove(this.item_1);
            })
    });

	gemini.suite('with_scroll', function (test) {

        test.setUrl('/regression_menu_icon_online_23.html').setCaptureElements('html')

            .before(function (actions, find) {
                actions.waitForElementToShow('[name="MenuIcon 1"]', 40000);
                this.button = find('[name="MenuIcon 1"]');
				actions.waitForElementToShow('[sbisname="TextBox 1"]', 40000);
                this.text_box = find('[sbisname="TextBox 1"] input');
				this.item_1 = find('[data-id="1"]');
            })

            .capture('plain', function (actions) {
                actions.mouseMove(this.text_box);
            })

            .capture('hovered', function (actions) {
                actions.mouseMove(this.button);
            })
			
			.capture('menu_opened', function (actions) {
                actions.click(this.button);
				actions.waitForElementToShow('[data-id="1"]', 1000);
				actions.waitForElementToShow('[data-id="2"]', 1000);
				actions.wait(1000);
            })
			
			.capture('hovered_item', function (actions) {
                actions.mouseMove(this.item_1);
            })
    });

    gemini.suite('disabled_with_icon16', function (test) {

        test.setUrl('/regression_menu_icon_online.html').setCaptureElements('.capture')

            .before(function (actions, find) {
                actions.waitForElementToShow('[name="MenuIcon 1"]', 40000);
                this.button = find('[name="MenuIcon 1"]');
				actions.waitForElementToShow('[sbisname="TextBox 1"]', 40000);
                actions.executeJS(function (window) {
                    window.$ws.single.ControlStorage.getByName('MenuIcon 1').setEnabled(false);
                });
            })

            .capture('plain')

            .capture('hovered', function (actions) {
                actions.mouseMove(this.button);
            })
    });
	
	gemini.suite('with_icon16_and_items_icon16_full', function (test) {

        test.setUrl('/regression_menu_icon_online_3.html').setCaptureElements('.capture')

            .before(function (actions, find) {
                actions.waitForElementToShow('[name="MenuIcon 1"]', 40000);
                this.button = find('[name="MenuIcon 1"]');
				actions.waitForElementToShow('[sbisname="TextBox 1"]', 40000);
                this.text_box = find('[sbisname="TextBox 1"] input');
				this.item_1 = find('[data-id="1"]');
            })

            .capture('plain', function (actions) {
                actions.click(this.text_box);
            })

            .capture('hovered', function (actions) {
                actions.mouseMove(this.button);
            })
			
			.capture('menu_opened', function (actions) {
                actions.click(this.button);
				actions.waitForElementToShow('[data-id="1"]', 1000);
				actions.waitForElementToShow('[data-id="2"]', 1000);
				actions.wait(1000);
            })
			
			.capture('hovered_item', function (actions) {
                actions.mouseMove(this.item_1);
            })
    });

    gemini.suite('disabled_with_icon16_and_items_icon16_full', function (test) {

        test.setUrl('/regression_menu_icon_online_3.html').setCaptureElements('.capture')

            .before(function (actions, find) {
                actions.waitForElementToShow('[name="MenuIcon 1"]', 40000);
                this.button = find('[name="MenuIcon 1"]');
				actions.waitForElementToShow('[sbisname="TextBox 1"]', 40000);
                actions.executeJS(function (window) {
                    window.$ws.single.ControlStorage.getByName('MenuIcon 1').setEnabled(false);
                });
            })

            .capture('plain')

            .capture('hovered', function (actions) {
                actions.mouseMove(this.button);
            })
    });
	
	gemini.suite('with_icon16_and_items_icon16_half', function (test) {

        test.setUrl('/regression_menu_icon_online_4.html').setCaptureElements('.capture')

            .before(function (actions, find) {
                actions.waitForElementToShow('[name="MenuIcon 1"]', 40000);
                this.button = find('[name="MenuIcon 1"]');
				actions.waitForElementToShow('[sbisname="TextBox 1"]', 40000);
                this.text_box = find('[sbisname="TextBox 1"] input');
				this.item_1 = find('[data-id="1"]');
            })

            .capture('plain', function (actions) {
                actions.click(this.text_box);
            })

            .capture('hovered', function (actions) {
                actions.mouseMove(this.button);
            })
			
			.capture('menu_opened', function (actions) {
                actions.click(this.button);
				actions.waitForElementToShow('[data-id="1"]', 1000);
				actions.waitForElementToShow('[data-id="2"]', 1000);
				actions.wait(1000);
            })
			
			.capture('hovered_item', function (actions) {
                actions.mouseMove(this.item_1);
            })
    });

    gemini.suite('disabled_with_icon16_and_items_icon16_half', function (test) {

        test.setUrl('/regression_menu_icon_online_4.html').setCaptureElements('.capture')

            .before(function (actions, find) {
                actions.waitForElementToShow('[name="MenuIcon 1"]', 40000);
                this.button = find('[name="MenuIcon 1"]');
				actions.waitForElementToShow('[sbisname="TextBox 1"]', 40000);
                actions.executeJS(function (window) {
                    window.$ws.single.ControlStorage.getByName('MenuIcon 1').setEnabled(false);
                });
            })

            .capture('plain')

            .capture('hovered', function (actions) {
                actions.mouseMove(this.button);
            })
    });

	gemini.suite('round_border_with_icon16', function (test) {

        test.setUrl('/regression_menu_icon_online_7.html').setCaptureElements('.capture')

            .before(function (actions, find) {
                actions.waitForElementToShow('[name="MenuIcon 1"]', 40000);
                this.button = find('[name="MenuIcon 1"]');
				actions.waitForElementToShow('[sbisname="TextBox 1"]', 40000);
                this.text_box = find('[sbisname="TextBox 1"] input');
				this.item_1 = find('[data-id="1"]');
            })

            .capture('plain', function (actions) {
                actions.click(this.text_box);
            })

            .capture('hovered', function (actions) {
                actions.mouseMove(this.button);
            })
			
			.capture('menu_opened', function (actions) {
                actions.click(this.button);
				actions.waitForElementToShow('[data-id="1"]', 1000);
				actions.waitForElementToShow('[data-id="2"]', 1000);
				actions.wait(1000);
            })
			
			.capture('hovered_item', function (actions) {
                actions.mouseMove(this.item_1);
            })
    });

    gemini.suite('disabled_round_border_with_icon16', function (test) {

        test.setUrl('/regression_menu_icon_online_7.html').setCaptureElements('.capture')

            .before(function (actions, find) {
                actions.waitForElementToShow('[name="MenuIcon 1"]', 40000);
                this.button = find('[name="MenuIcon 1"]');
				actions.waitForElementToShow('[sbisname="TextBox 1"]', 40000);
                actions.executeJS(function (window) {
                    window.$ws.single.ControlStorage.getByName('MenuIcon 1').setEnabled(false);
                });
            })

            .capture('plain')

            .capture('hovered', function (actions) {
                actions.mouseMove(this.button);
            })
    });
	
	gemini.suite('round_border_with_icon16_and_items_icon16_full', function (test) {

        test.setUrl('/regression_menu_icon_online_9.html').setCaptureElements('.capture')

            .before(function (actions, find) {
                actions.waitForElementToShow('[name="MenuIcon 1"]', 40000);
                this.button = find('[name="MenuIcon 1"]');
				actions.waitForElementToShow('[sbisname="TextBox 1"]', 40000);
                this.text_box = find('[sbisname="TextBox 1"] input');
				this.item_1 = find('[data-id="1"]');
            })

            .capture('plain', function (actions) {
                actions.click(this.text_box);
            })

            .capture('hovered', function (actions) {
                actions.mouseMove(this.button);
            })
			
			.capture('menu_opened', function (actions) {
                actions.click(this.button);
				actions.waitForElementToShow('[data-id="1"]', 1000);
				actions.waitForElementToShow('[data-id="2"]', 1000);
				actions.wait(1000);
            })
			
			.capture('hovered_item', function (actions) {
                actions.mouseMove(this.item_1);
            })
    });

    gemini.suite('disabled_round_border_with_icon16_and_items_icon16_full', function (test) {

        test.setUrl('/regression_menu_icon_online_9.html').setCaptureElements('.capture')

            .before(function (actions, find) {
                actions.waitForElementToShow('[name="MenuIcon 1"]', 40000);
                this.button = find('[name="MenuIcon 1"]');
				actions.waitForElementToShow('[sbisname="TextBox 1"]', 40000);
                actions.executeJS(function (window) {
                    window.$ws.single.ControlStorage.getByName('MenuIcon 1').setEnabled(false);
                });
            })

            .capture('plain')

            .capture('hovered', function (actions) {
                actions.mouseMove(this.button);
            })
    });
	
	gemini.suite('round_border_with_icon16_and_items_icon16_half', function (test) {

        test.setUrl('/regression_menu_icon_online_10.html').setCaptureElements('.capture')

            .before(function (actions, find) {
                actions.waitForElementToShow('[name="MenuIcon 1"]', 40000);
                this.button = find('[name="MenuIcon 1"]');
				actions.waitForElementToShow('[sbisname="TextBox 1"]', 40000);
                this.text_box = find('[sbisname="TextBox 1"] input');
				this.item_1 = find('[data-id="1"]');
            })

            .capture('plain', function (actions) {
                actions.click(this.text_box);
            })

            .capture('hovered', function (actions) {
                actions.mouseMove(this.button);
            })
			
			.capture('menu_opened', function (actions) {
                actions.click(this.button);
				actions.waitForElementToShow('[data-id="1"]', 1000);
				actions.waitForElementToShow('[data-id="2"]', 1000);
				actions.wait(1000);
            })
			
			.capture('hovered_item', function (actions) {
                actions.mouseMove(this.item_1);
            })
    });

    gemini.suite('disabled_round_border_with_icon16_and_items_icon16_half', function (test) {

        test.setUrl('/regression_menu_icon_online_10.html').setCaptureElements('.capture')

            .before(function (actions, find) {
                actions.waitForElementToShow('[name="MenuIcon 1"]', 40000);
                this.button = find('[name="MenuIcon 1"]');
				actions.waitForElementToShow('[sbisname="TextBox 1"]', 40000);
                actions.executeJS(function (window) {
                    window.$ws.single.ControlStorage.getByName('MenuIcon 1').setEnabled(false);
                });
            })

            .capture('plain')

            .capture('hovered', function (actions) {
                actions.mouseMove(this.button);
            })
    });
	
	gemini.suite('with_icon24', function (test) {

        test.setUrl('/regression_menu_icon_online_2.html').setCaptureElements('.capture')

            .before(function (actions, find) {
                actions.waitForElementToShow('[name="MenuIcon 1"]', 40000);
                this.button = find('[name="MenuIcon 1"]');
				actions.waitForElementToShow('[sbisname="TextBox 1"]', 40000);
                this.text_box = find('[sbisname="TextBox 1"] input');
				this.item_1 = find('[data-id="1"]');
            })

            .capture('plain', function (actions) {
                actions.click(this.text_box);
            })

            .capture('hovered', function (actions) {
                actions.mouseMove(this.button);
            })
			
			.capture('menu_opened', function (actions) {
                actions.click(this.button);
				actions.waitForElementToShow('[data-id="1"]', 1000);
				actions.waitForElementToShow('[data-id="2"]', 1000);
				actions.wait(1000);
            })
			
			.capture('hovered_item', function (actions) {
                actions.mouseMove(this.item_1);
            })
    });

    gemini.suite('disabled_with_icon24', function (test) {

        test.setUrl('/regression_menu_icon_online_2.html').setCaptureElements('.capture')

            .before(function (actions, find) {
                actions.waitForElementToShow('[name="MenuIcon 1"]', 40000);
                this.button = find('[name="MenuIcon 1"]');
				actions.waitForElementToShow('[sbisname="TextBox 1"]', 40000);
                actions.executeJS(function (window) {
                    window.$ws.single.ControlStorage.getByName('MenuIcon 1').setEnabled(false);
                });
            })

            .capture('plain')

            .capture('hovered', function (actions) {
                actions.mouseMove(this.button);
            })
    });
	
	gemini.suite('with_icon24_and_items_icon24_full', function (test) {

        test.setUrl('/regression_menu_icon_online_5.html').setCaptureElements('.capture')

            .before(function (actions, find) {
                actions.waitForElementToShow('[name="MenuIcon 1"]', 40000);
                this.button = find('[name="MenuIcon 1"]');
				actions.waitForElementToShow('[sbisname="TextBox 1"]', 40000);
                this.text_box = find('[sbisname="TextBox 1"] input');
				this.item_1 = find('[data-id="1"]');
            })

            .capture('plain', function (actions) {
                actions.click(this.text_box);
            })

            .capture('hovered', function (actions) {
                actions.mouseMove(this.button);
            })
			
			.capture('menu_opened', function (actions) {
                actions.click(this.button);
				actions.waitForElementToShow('[data-id="1"]', 1000);
				actions.waitForElementToShow('[data-id="2"]', 1000);
				actions.wait(1000);
            })
			
			.capture('hovered_item', function (actions) {
                actions.mouseMove(this.item_1);
            })
    });

    gemini.suite('disabled_with_icon24_and_items_icon24_full', function (test) {

        test.setUrl('/regression_menu_icon_online_5.html').setCaptureElements('.capture')

            .before(function (actions, find) {
                actions.waitForElementToShow('[name="MenuIcon 1"]', 40000);
                this.button = find('[name="MenuIcon 1"]');
				actions.waitForElementToShow('[sbisname="TextBox 1"]', 40000);
                actions.executeJS(function (window) {
                    window.$ws.single.ControlStorage.getByName('MenuIcon 1').setEnabled(false);
                });
            })

            .capture('plain')

            .capture('hovered', function (actions) {
                actions.mouseMove(this.button);
            })
    });
	
	gemini.suite('with_icon24_and_items_icon24_half', function (test) {

        test.setUrl('/regression_menu_icon_online_6.html').setCaptureElements('.capture')

            .before(function (actions, find) {
                actions.waitForElementToShow('[name="MenuIcon 1"]', 40000);
                this.button = find('[name="MenuIcon 1"]');
				actions.waitForElementToShow('[sbisname="TextBox 1"]', 40000);
                this.text_box = find('[sbisname="TextBox 1"] input');
				this.item_1 = find('[data-id="1"]');
            })

            .capture('plain', function (actions) {
                actions.click(this.text_box);
            })

            .capture('hovered', function (actions) {
                actions.mouseMove(this.button);
            })
			
			.capture('menu_opened', function (actions) {
                actions.click(this.button);
				actions.waitForElementToShow('[data-id="1"]', 1000);
				actions.waitForElementToShow('[data-id="2"]', 1000);
				actions.wait(1000);
            })
			
			.capture('hovered_item', function (actions) {
                actions.mouseMove(this.item_1);
            })
    });

    gemini.suite('disabled_with_icon24_and_items_icon24_half', function (test) {

        test.setUrl('/regression_menu_icon_online_6.html').setCaptureElements('.capture')

            .before(function (actions, find) {
                actions.waitForElementToShow('[name="MenuIcon 1"]', 40000);
                this.button = find('[name="MenuIcon 1"]');
				actions.waitForElementToShow('[sbisname="TextBox 1"]', 40000);
                actions.executeJS(function (window) {
                    window.$ws.single.ControlStorage.getByName('MenuIcon 1').setEnabled(false);
                });
            })

            .capture('plain')

            .capture('hovered', function (actions) {
                actions.mouseMove(this.button);
            })
    });

	gemini.suite('round_border_with_icon24', function (test) {

        test.setUrl('/regression_menu_icon_online_8.html').setCaptureElements('.capture')

            .before(function (actions, find) {
                actions.waitForElementToShow('[name="MenuIcon 1"]', 40000);
                this.button = find('[name="MenuIcon 1"]');
				actions.waitForElementToShow('[sbisname="TextBox 1"]', 40000);
                this.text_box = find('[sbisname="TextBox 1"] input');
				this.item_1 = find('[data-id="1"]');
            })

            .capture('plain', function (actions) {
                actions.click(this.text_box);
            })

            .capture('hovered', function (actions) {
                actions.mouseMove(this.button);
            })
			
			.capture('menu_opened', function (actions) {
                actions.click(this.button);
				actions.waitForElementToShow('[data-id="1"]', 1000);
				actions.waitForElementToShow('[data-id="2"]', 1000);
				actions.wait(1000);
            })
			
			.capture('hovered_item', function (actions) {
                actions.mouseMove(this.item_1);
            })
    });

    gemini.suite('disabled_round_border_with_icon24', function (test) {

        test.setUrl('/regression_menu_icon_online_8.html').setCaptureElements('.capture')

            .before(function (actions, find) {
                actions.waitForElementToShow('[name="MenuIcon 1"]', 40000);
                this.button = find('[name="MenuIcon 1"]');
				actions.waitForElementToShow('[sbisname="TextBox 1"]', 40000);
                actions.executeJS(function (window) {
                    window.$ws.single.ControlStorage.getByName('MenuIcon 1').setEnabled(false);
                });
            })

            .capture('plain')

            .capture('hovered', function (actions) {
                actions.mouseMove(this.button);
            })
    });
	
	gemini.suite('round_border_with_icon24_and_items_icon24_full', function (test) {

        test.setUrl('/regression_menu_icon_online_11.html').setCaptureElements('.capture')

            .before(function (actions, find) {
                actions.waitForElementToShow('[name="MenuIcon 1"]', 40000);
                this.button = find('[name="MenuIcon 1"]');
				actions.waitForElementToShow('[sbisname="TextBox 1"]', 40000);
                this.text_box = find('[sbisname="TextBox 1"] input');
				this.item_1 = find('[data-id="1"]');
            })

            .capture('plain', function (actions) {
                actions.click(this.text_box);
            })

            .capture('hovered', function (actions) {
                actions.mouseMove(this.button);
            })
			
			.capture('menu_opened', function (actions) {
                actions.click(this.button);
				actions.waitForElementToShow('[data-id="1"]', 1000);
				actions.waitForElementToShow('[data-id="2"]', 1000);
				actions.wait(1000);
            })
			
			.capture('hovered_item', function (actions) {
                actions.mouseMove(this.item_1);
            })
    });

    gemini.suite('disabled_round_border_with_icon24_and_items_icon24_full', function (test) {

        test.setUrl('/regression_menu_icon_online_11.html').setCaptureElements('.capture')

            .before(function (actions, find) {
                actions.waitForElementToShow('[name="MenuIcon 1"]', 40000);
                this.button = find('[name="MenuIcon 1"]');
				actions.waitForElementToShow('[sbisname="TextBox 1"]', 40000);
                actions.executeJS(function (window) {
                    window.$ws.single.ControlStorage.getByName('MenuIcon 1').setEnabled(false);
                });
            })

            .capture('plain')

            .capture('hovered', function (actions) {
                actions.mouseMove(this.button);
            })
    });
	
	gemini.suite('round_border_with_icon24_and_items_icon24_half', function (test) {

        test.setUrl('/regression_menu_icon_online_12.html').setCaptureElements('.capture')

            .before(function (actions, find) {
                actions.waitForElementToShow('[name="MenuIcon 1"]', 40000);
                this.button = find('[name="MenuIcon 1"]');
				actions.waitForElementToShow('[sbisname="TextBox 1"]', 40000);
                this.text_box = find('[sbisname="TextBox 1"] input');
				this.item_1 = find('[data-id="1"]');
            })

            .capture('plain', function (actions) {
                actions.click(this.text_box);
            })

            .capture('hovered', function (actions) {
                actions.mouseMove(this.button);
            })
			
			.capture('menu_opened', function (actions) {
                actions.click(this.button);
				actions.waitForElementToShow('[data-id="1"]', 1000);
				actions.waitForElementToShow('[data-id="2"]', 1000);
				actions.wait(1000);
            })
			
			.capture('hovered_item', function (actions) {
                actions.mouseMove(this.item_1);
            })
    });

    gemini.suite('disabled_round_border_with_icon24_and_items_icon24_half', function (test) {

        test.setUrl('/regression_menu_icon_online_12.html').setCaptureElements('.capture')

            .before(function (actions, find) {
                actions.waitForElementToShow('[name="MenuIcon 1"]', 40000);
                this.button = find('[name="MenuIcon 1"]');
				actions.waitForElementToShow('[sbisname="TextBox 1"]', 40000);
                actions.executeJS(function (window) {
                    window.$ws.single.ControlStorage.getByName('MenuIcon 1').setEnabled(false);
                });
            })

            .capture('plain')

            .capture('hovered', function (actions) {
                actions.mouseMove(this.button);
            })
    });
	
	gemini.suite('without_menu_with_icon16', function (test) {

        test.setUrl('/regression_menu_icon_online_13.html').setCaptureElements('.capture')

            .before(function (actions, find) {
                actions.waitForElementToShow('[name="MenuIcon 1"]', 40000);
                this.button = find('[name="MenuIcon 1"]');
				actions.waitForElementToShow('[sbisname="TextBox 1"]', 40000);
                this.text_box = find('[sbisname="TextBox 1"] input');
            })

            .capture('plain', function (actions) {
                actions.click(this.text_box);
            })

            .capture('hovered', function (actions) {
                actions.mouseMove(this.button);
            })
    });

    gemini.suite('disabled_without_menu_with_icon16', function (test) {

        test.setUrl('/regression_menu_icon_online_13.html').setCaptureElements('.capture')

            .before(function (actions, find) {
                actions.waitForElementToShow('[name="MenuIcon 1"]', 40000);
                this.button = find('[name="MenuIcon 1"]');
				actions.waitForElementToShow('[sbisname="TextBox 1"]', 40000);
                actions.executeJS(function (window) {
                    window.$ws.single.ControlStorage.getByName('MenuIcon 1').setEnabled(false);
                });
            })

            .capture('plain')

            .capture('hovered', function (actions) {
                actions.mouseMove(this.button);
            })
    });

	gemini.suite('without_menu_with_icon24', function (test) {

        test.setUrl('/regression_menu_icon_online_14.html').setCaptureElements('.capture')

            .before(function (actions, find) {
                actions.waitForElementToShow('[name="MenuIcon 1"]', 40000);
                this.button = find('[name="MenuIcon 1"]');
				actions.waitForElementToShow('[sbisname="TextBox 1"]', 40000);
                this.text_box = find('[sbisname="TextBox 1"] input');
            })

            .capture('plain', function (actions) {
                actions.click(this.text_box);
            })

            .capture('hovered', function (actions) {
                actions.mouseMove(this.button);
            })
    });

    gemini.suite('disabled_without_menu_with_icon24', function (test) {

        test.setUrl('/regression_menu_icon_online_14.html').setCaptureElements('.capture')

            .before(function (actions, find) {
                actions.waitForElementToShow('[name="MenuIcon 1"]', 40000);
                this.button = find('[name="MenuIcon 1"]');
				actions.waitForElementToShow('[sbisname="TextBox 1"]', 40000);
                actions.executeJS(function (window) {
                    window.$ws.single.ControlStorage.getByName('MenuIcon 1').setEnabled(false);
                });
            })

            .capture('plain')

            .capture('hovered', function (actions) {
                actions.mouseMove(this.button);
            })
    });	

	gemini.suite('round_border_without_menu_with_icon16', function (test) {

        test.setUrl('/regression_menu_icon_online_15.html').setCaptureElements('.capture')

            .before(function (actions, find) {
                actions.waitForElementToShow('[name="MenuIcon 1"]', 40000);
                this.button = find('[name="MenuIcon 1"]');
				actions.waitForElementToShow('[sbisname="TextBox 1"]', 40000);
				this.text_box = find('[sbisname="TextBox 1"] input');
            })

            .capture('plain', function (actions) {
                actions.click(this.text_box);
            })

            .capture('hovered', function (actions) {
                actions.mouseMove(this.button);
            })
    });

    gemini.suite('disabled_round_border_without_menu_with_icon16', function (test) {

        test.setUrl('/regression_menu_icon_online_15.html').setCaptureElements('.capture')

            .before(function (actions, find) {
                actions.waitForElementToShow('[name="MenuIcon 1"]', 40000);
                this.button = find('[name="MenuIcon 1"]');
				actions.waitForElementToShow('[sbisname="TextBox 1"]', 40000);
                actions.executeJS(function (window) {
                    window.$ws.single.ControlStorage.getByName('MenuIcon 1').setEnabled(false);
                });
            })

            .capture('plain')

            .capture('hovered', function (actions) {
                actions.mouseMove(this.button);
            })
    });

	gemini.suite('round_border_without_menu_with_icon24', function (test) {

        test.setUrl('/regression_menu_icon_online_16.html').setCaptureElements('.capture')

            .before(function (actions, find) {
                actions.waitForElementToShow('[name="MenuIcon 1"]', 40000);
                this.button = find('[name="MenuIcon 1"]');
				actions.waitForElementToShow('[sbisname="TextBox 1"]', 40000);
				this.text_box = find('[sbisname="TextBox 1"] input');				
            })

            .capture('plain', function (actions) {
                actions.click(this.text_box);
            })

            .capture('hovered', function (actions) {
                actions.mouseMove(this.button);
            })
    });

    gemini.suite('disabled_round_border_without_menu_with_icon24', function (test) {

        test.setUrl('/regression_menu_icon_online_16.html').setCaptureElements('.capture')

            .before(function (actions, find) {
                actions.waitForElementToShow('[name="MenuIcon 1"]', 40000);
                this.button = find('[name="MenuIcon 1"]');
				actions.waitForElementToShow('[sbisname="TextBox 1"]', 40000);
                actions.executeJS(function (window) {
                    window.$ws.single.ControlStorage.getByName('MenuIcon 1').setEnabled(false);
                });
            })

            .capture('plain')

            .capture('hovered', function (actions) {
                actions.mouseMove(this.button);
            })
    });	
	
	gemini.suite('with_icon16_with_submenu', function (test) {

        test.setUrl('/regression_menu_icon_online_17.html').setCaptureElements('.capture')

            .before(function (actions, find) {
                actions.waitForElementToShow('[name="MenuIcon 1"]', 40000);
                this.button = find('[name="MenuIcon 1"]');
				actions.waitForElementToShow('[sbisname="TextBox 1"]', 40000);
                this.text_box = find('[sbisname="TextBox 1"] input');
				this.item_1 = find('[data-id="1"]');
				this.item_3 = find('[data-id="3"]');
            })

            .capture('plain', function (actions) {
                actions.click(this.text_box);
            })

            .capture('hovered', function (actions) {
                actions.mouseMove(this.button);
            })
			
			.capture('menu_opened', function (actions) {
                actions.click(this.button);
				actions.waitForElementToShow('[data-id="1"]', 1000);
				actions.waitForElementToShow('[data-id="2"]', 1000);
				actions.wait(1000);
            })
			
			.capture('submenu_opened', function (actions) {
                actions.mouseMove(this.item_1);
				actions.waitForElementToShow('[data-id="3"]', 1000);
            })
			
			.capture('hovered_item', function (actions) {
                actions.mouseMove(this.item_3);
            })
    });
	
	gemini.suite('right_side_with_icon16_with_submenu', function (test) {

        test.setUrl('/regression_menu_icon_online_17.html').skip('firefox').setCaptureElements('html')

            .before(function (actions, find) {
                actions.waitForElementToShow('[name="MenuIcon 1"]', 40000);
                this.button = find('[name="MenuIcon 1"]');
				actions.waitForElementToShow('[sbisname="TextBox 1"]', 40000);
                this.text_box = find('[sbisname="TextBox 1"] input');
				this.item_1 = find('[data-id="1"]');
				this.item_3 = find('[data-id="3"]');
            })

            .capture('plain', function (actions) {
				actions.executeJS(function (window) {
					var offset = document.body.clientWidth - $('[sbisname="MenuIcon 1"]').width() - 20
                    window.$('[sbisname="MenuIcon 1"]').offset({'left': offset, 'top': 20});
                });
				actions.mouseMove(this.text_box);
            })

            .capture('hovered', function (actions) {
                actions.mouseMove(this.button);
            })
			
			.capture('menu_opened', function (actions) {
                actions.click(this.button);
				actions.waitForElementToShow('[data-id="1"]', 1000);
				actions.waitForElementToShow('[data-id="2"]', 1000);
				actions.wait(1000);
            })
			
			.capture('submenu_opened', function (actions) {
                actions.mouseMove(this.item_1);
				actions.waitForElementToShow('[data-id="3"]', 1000);
            })
			
			.capture('hovered_item', function (actions) {
                actions.mouseMove(this.item_3);
            })
    });
	
	gemini.suite('bottom_side_with_submenu', function (test) {

        test.setUrl('/regression_menu_icon_online_17.html').skip('firefox').setCaptureElements('html')

            .before(function (actions, find) {
                actions.waitForElementToShow('[name="MenuIcon 1"]', 40000);
                this.button = find('[name="MenuIcon 1"]');
				actions.waitForElementToShow('[sbisname="TextBox 1"]', 40000);
                this.text_box = find('[sbisname="TextBox 1"] input');
				this.item_1 = find('[data-id="1"]');
            })

            .capture('plain', function (actions) {
                actions.executeJS(function (window) {
                    window.$('[sbisname="MenuIcon 1"]').offset({'left': 20, 'top': 850});
                });
				actions.mouseMove(this.text_box);
            })

            .capture('hovered', function (actions) {
                actions.mouseMove(this.button);
            })
			
			.capture('menu_opened', function (actions) {
                actions.click(this.button);
				actions.waitForElementToShow('[data-id="1"]', 1000);
				actions.waitForElementToShow('[data-id="2"]', 1000);
				actions.wait(1000);
            })
			
			.capture('hovered_item', function (actions) {
                actions.mouseMove(this.item_1);
            })
    });
	
	gemini.suite('bottom_right_side_with_submenu', function (test) {

        test.setUrl('/regression_menu_icon_online_17.html').skip('firefox').setCaptureElements('html')

            .before(function (actions, find) {
                actions.waitForElementToShow('[name="MenuIcon 1"]', 40000);
                this.button = find('[name="MenuIcon 1"]');
				actions.waitForElementToShow('[sbisname="TextBox 1"]', 40000);
                this.text_box = find('[sbisname="TextBox 1"] input');
				this.item_1 = find('[data-id="1"]');
            })

            .capture('plain', function (actions) {
                actions.executeJS(function (window) {
					var offset = document.body.clientWidth - $('[sbisname="MenuIcon 1"]').width() - 20
                    window.$('[sbisname="MenuIcon 1"]').offset({'left': offset, 'top': 850});
                });
				actions.mouseMove(this.text_box);
            })

            .capture('hovered', function (actions) {
                actions.mouseMove(this.button);
            })
			
			.capture('menu_opened', function (actions) {
                actions.click(this.button);
				actions.waitForElementToShow('[data-id="1"]', 1000);
				actions.waitForElementToShow('[data-id="2"]', 1000);
				actions.wait(1000);
            })
			
			.capture('hovered_item', function (actions) {
                actions.mouseMove(this.item_1);
            })
    });

    gemini.suite('disabled_with_icon16_with_submenu', function (test) {

        test.setUrl('/regression_menu_icon_online_17.html').setCaptureElements('.capture')

            .before(function (actions, find) {
                actions.waitForElementToShow('[name="MenuIcon 1"]', 40000);
                this.button = find('[name="MenuIcon 1"]');
				actions.waitForElementToShow('[sbisname="TextBox 1"]', 40000);
                actions.executeJS(function (window) {
                    window.$ws.single.ControlStorage.getByName('MenuIcon 1').setEnabled(false);
                });
            })

            .capture('plain')

            .capture('hovered', function (actions) {
                actions.mouseMove(this.button);
            })
    });
	
	gemini.suite('with_submenu_icon16_and_item_icon16_full', function (test) {

        test.setUrl('/regression_menu_icon_online_18.html').setCaptureElements('.capture')

            .before(function (actions, find) {
                actions.waitForElementToShow('[name="MenuIcon 1"]', 40000);
                this.button = find('[name="MenuIcon 1"]');
				actions.waitForElementToShow('[sbisname="TextBox 1"]', 40000);
                this.text_box = find('[sbisname="TextBox 1"] input');
				this.item_1 = find('[data-id="1"]');
				this.item_3 = find('[data-id="3"]');
            })

            .capture('plain', function (actions) {
                actions.click(this.text_box);
            })

            .capture('hovered', function (actions) {
                actions.mouseMove(this.button);
            })
			
			.capture('menu_opened', function (actions) {
                actions.click(this.button);
				actions.waitForElementToShow('[data-id="1"]', 1000);
				actions.waitForElementToShow('[data-id="2"]', 1000);
				actions.wait(1000);
            })
			
			.capture('submenu_opened', function (actions) {
                actions.mouseMove(this.item_1);
				actions.waitForElementToShow('[data-id="3"]', 1000);
            })
			
			.capture('hovered_item', function (actions) {
                actions.mouseMove(this.item_3);
            })
    });

    gemini.suite('disabled_with_submenu_icon16_and_item_icon16_full', function (test) {

        test.setUrl('/regression_menu_icon_online_18.html').setCaptureElements('.capture')

            .before(function (actions, find) {
                actions.waitForElementToShow('[name="MenuIcon 1"]', 40000);
                this.button = find('[name="MenuIcon 1"]');
				actions.waitForElementToShow('[sbisname="TextBox 1"]', 40000);
                actions.executeJS(function (window) {
                    window.$ws.single.ControlStorage.getByName('MenuIcon 1').setEnabled(false);
                });
            })

            .capture('plain')

            .capture('hovered', function (actions) {
                actions.mouseMove(this.button);
            })
    });
	
	gemini.suite('with_submenu_icon16_and_item_icon16_half', function (test) {

        test.setUrl('/regression_menu_icon_online_19.html').setCaptureElements('.capture')

            .before(function (actions, find) {
                actions.waitForElementToShow('[name="MenuIcon 1"]', 40000);
                this.button = find('[name="MenuIcon 1"]');
				actions.waitForElementToShow('[sbisname="TextBox 1"]', 40000);
                this.text_box = find('[sbisname="TextBox 1"] input');
				this.item_1 = find('[data-id="1"]');
				this.item_3 = find('[data-id="3"]');
            })

            .capture('plain', function (actions) {
                actions.click(this.text_box);
            })

            .capture('hovered', function (actions) {
                actions.mouseMove(this.button);
            })
			
			.capture('menu_opened', function (actions) {
                actions.click(this.button);
				actions.waitForElementToShow('[data-id="1"]', 1000);
				actions.waitForElementToShow('[data-id="2"]', 1000);
				actions.wait(1000);
            })
			
			.capture('submenu_opened', function (actions) {
                actions.mouseMove(this.item_1);
				actions.waitForElementToShow('[data-id="3"]', 1000);
            })
			
			.capture('hovered_item', function (actions) {
                actions.mouseMove(this.item_3);
            })
    });

    gemini.suite('disabled_with_submenu_icon16_and_item_icon16_half', function (test) {

        test.setUrl('/regression_menu_icon_online_19.html').setCaptureElements('.capture')

            .before(function (actions, find) {
                actions.waitForElementToShow('[name="MenuIcon 1"]', 40000);
                this.button = find('[name="MenuIcon 1"]');
				actions.waitForElementToShow('[sbisname="TextBox 1"]', 40000);
                actions.executeJS(function (window) {
                    window.$ws.single.ControlStorage.getByName('MenuIcon 1').setEnabled(false);
                });
            })

            .capture('plain')

            .capture('hovered', function (actions) {
                actions.mouseMove(this.button);
            })
    });
	
	
	gemini.suite('with_submenu_icon24_and_item_icon24_full', function (test) {

        test.setUrl('/regression_menu_icon_online_20.html').setCaptureElements('.capture')

            .before(function (actions, find) {
                actions.waitForElementToShow('[name="MenuIcon 1"]', 40000);
                this.button = find('[name="MenuIcon 1"]');
				actions.waitForElementToShow('[sbisname="TextBox 1"]', 40000);
                this.text_box = find('[sbisname="TextBox 1"] input');
				this.item_1 = find('[data-id="1"]');
				this.item_3 = find('[data-id="3"]');
            })

            .capture('plain', function (actions) {
                actions.click(this.text_box);
            })

            .capture('hovered', function (actions) {
                actions.mouseMove(this.button);
            })
			
			.capture('menu_opened', function (actions) {
                actions.click(this.button);
				actions.waitForElementToShow('[data-id="1"]', 1000);
				actions.waitForElementToShow('[data-id="2"]', 1000);
				actions.wait(1000);
            })
			
			.capture('submenu_opened', function (actions) {
                actions.mouseMove(this.item_1);
				actions.waitForElementToShow('[data-id="3"]', 1000);
            })
			
			.capture('hovered_item', function (actions) {
                actions.mouseMove(this.item_3);
            })
    });

    gemini.suite('disabled_with_submenu_icon24_and_item_icon24_full', function (test) {

        test.setUrl('/regression_menu_icon_online_20.html').setCaptureElements('.capture')

            .before(function (actions, find) {
                actions.waitForElementToShow('[name="MenuIcon 1"]', 40000);
                this.button = find('[name="MenuIcon 1"]');
				actions.waitForElementToShow('[sbisname="TextBox 1"]', 40000);
                actions.executeJS(function (window) {
                    window.$ws.single.ControlStorage.getByName('MenuIcon 1').setEnabled(false);
                });
            })

            .capture('plain')

            .capture('hovered', function (actions) {
                actions.mouseMove(this.button);
            })
    });
	
	gemini.suite('with_submenu_icon24_and_item_icon24_half', function (test) {

        test.setUrl('/regression_menu_icon_online_21.html').setCaptureElements('.capture')

            .before(function (actions, find) {
                actions.waitForElementToShow('[name="MenuIcon 1"]', 40000);
                this.button = find('[name="MenuIcon 1"]');
				actions.waitForElementToShow('[sbisname="TextBox 1"]', 40000);
                this.text_box = find('[sbisname="TextBox 1"] input');
				this.item_1 = find('[data-id="1"]');
				this.item_3 = find('[data-id="3"]');
            })

            .capture('plain', function (actions) {
                actions.click(this.text_box);
            })

            .capture('hovered', function (actions) {
                actions.mouseMove(this.button);
            })
			
			.capture('menu_opened', function (actions) {
                actions.click(this.button);
				actions.waitForElementToShow('[data-id="1"]', 1000);
				actions.waitForElementToShow('[data-id="2"]', 1000);
				actions.wait(1000);
            })
			
			.capture('submenu_opened', function (actions) {
                actions.mouseMove(this.item_1);
				actions.waitForElementToShow('[data-id="3"]', 1000);
            })
			
			.capture('hovered_item', function (actions) {
                actions.mouseMove(this.item_3);
            })
    });

    gemini.suite('disabled_with_submenu_icon24_and_item_icon24_half', function (test) {

        test.setUrl('/regression_menu_icon_online_21.html').setCaptureElements('.capture')

            .before(function (actions, find) {
                actions.waitForElementToShow('[name="MenuIcon 1"]', 40000);
                this.button = find('[name="MenuIcon 1"]');
				actions.waitForElementToShow('[sbisname="TextBox 1"]', 40000);
                actions.executeJS(function (window) {
                    window.$ws.single.ControlStorage.getByName('MenuIcon 1').setEnabled(false);
                });
            })

            .capture('plain')

            .capture('hovered', function (actions) {
                actions.mouseMove(this.button);
            })
    });
	
	gemini.suite('with_submenu_and_item_icon24_half', function (test) {

        test.setUrl('/regression_menu_icon_online_22.html').setCaptureElements('.capture')

            .before(function (actions, find) {
                actions.waitForElementToShow('[name="MenuIcon 1"]', 40000);
                this.button = find('[name="MenuIcon 1"]');
				actions.waitForElementToShow('[sbisname="TextBox 1"]', 40000);
                this.text_box = find('[sbisname="TextBox 1"] input');
				this.item_1 = find('[data-id="1"]');
				this.item_3 = find('[data-id="3"]');
            })

            .capture('plain', function (actions) {
                actions.click(this.text_box);
            })

            .capture('hovered', function (actions) {
                actions.mouseMove(this.button);
            })
			
			.capture('menu_opened', function (actions) {
                actions.click(this.button);
				actions.waitForElementToShow('[data-id="1"]', 1000);
				actions.waitForElementToShow('[data-id="2"]', 1000);
				actions.wait(1000);
            })
			
			.capture('submenu_opened', function (actions) {
                actions.mouseMove(this.item_1);
				actions.waitForElementToShow('[data-id="3"]', 1000);
            })
			
			.capture('hovered_item', function (actions) {
                actions.mouseMove(this.item_3);
            })
    });

    gemini.suite('disabled_with_submenu_and_item_icon24_half', function (test) {

        test.setUrl('/regression_menu_icon_online_22.html').setCaptureElements('.capture')

            .before(function (actions, find) {
                actions.waitForElementToShow('[name="MenuIcon 1"]', 40000);
                this.button = find('[name="MenuIcon 1"]');
				actions.waitForElementToShow('[sbisname="TextBox 1"]', 40000);
                actions.executeJS(function (window) {
                    window.$ws.single.ControlStorage.getByName('MenuIcon 1').setEnabled(false);
                });
            })

            .capture('plain')

            .capture('hovered', function (actions) {
                actions.mouseMove(this.button);
            })
    });
});