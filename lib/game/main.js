ig.module('game.main')

.requires(
	'impact.game',
	'impact.font',
	
	'game.entities.player',
	'game.levels.lvl1',
	
	'impact.debug.debug',
	
	'plugins.client',
	'plugins.notification-manager',
	'plugins.lights',
	'plugins.screen-fader',
	'plugins.analog-stick',
	'plugins.touch-button'
	)

.defines(function()
{
	var scale;
	//Determine how much to scale the game	
	if (ig.ua.mobile)
		scale = 2;
	else
		scale = 3;
	
	MyGame = ig.Game.extend({
		font: new ig.Font( 'media/04b03.font.png' ),
		buttonImage: new ig.Image( 'media/buttons.png' ),
		
		buttons: [],
		gravity: 200,
		
		lightManager: '',
		note: new ig.NotificationManager(),
		
		//Initialization
		init: function()
		{
			//Mobile device controls
			if( ig.ua.mobile )
			{
				ig.Sound.enabled = false;
				
				var ypos = ig.system.height - 48;
				var xpos = ig.system.width - 40;
				
				this.buttons = [
				    //new ig.TouchButton('left', 0, ypos, 40, 48, this.buttonImage, 0),
				    //new ig.TouchButton('right', 40, ypos, 40, 48, this.buttonImage, 1),
				    new ig.TouchButton('shoot', xpos - 40, ypos, 40, 48, this.buttonImage, 2),
				    new ig.TouchButton('jump', xpos, ypos, 40, 48, this.buttonImage, 3)
				];
		
				var baseSize = 40;
				var stickSize = 20;
				var margin = 10;
				var y = ig.system.height * scale - baseSize - margin;
				var x = baseSize + margin;
	
				this.stickLeft = new ig.AnalogStick( x, y, baseSize, stickSize );
			}
			//PC Controls
			else
			{
				ig.input.initMouse();
				ig.input.bind( ig.KEY.A, 'left' );
				ig.input.bind( ig.KEY.D, 'right' );
				ig.input.bind( ig.KEY.W, 'up' );
				ig.input.bind( ig.KEY.S, 'down' );
				ig.input.bind( ig.KEY.MOUSE1, 'shoot' );
				ig.input.bind( ig.KEY.MOUSE2, 'jump' );
			}
			this.lightManager = new ig.LightManager('rgba(0,0,0,.8)', [0,0,0, 255*.8]);
			
			this.loadLevel(LevelLvl1);
			
			var player = this.getEntitiesByType(EntityPlayer)[0];
			
			//Connect to the server
			this.gamesocket = new ig.ImpactConnect(player, 80);
		},
		
		loadLevel: function( data )
		{
			this.parent( data );
			    
			//Pre-render all backgrounds
			for( var i = 0; i < this.backgroundMaps.length; i++ )
				this.backgroundMaps[i].preRender = true;
			
			//Fade to new level
			this.screenFader = new ig.ScreenFader({ fade: 'out', speed: 0.5 });
		},
		
		update: function()
		{
			this.parent();
			
			//Camera to follow player
			var player = this.getEntitiesByType( EntityPlayer )[0];
			if(player)
			{
				this.screen.x = player.pos.x - ig.system.width/2;
				this.screen.y = player.pos.y - ig.system.height/2;
			}
			
			// update our shadowmap/lightmap state
			this.lightManager.update();
			this.note.update();
		},
		
		draw: function()
		{
			// Draw all entities and backgroundMaps
			this.parent();
			this.note.draw();
			
			//Draw lighting
			//this.lightManager.shine();
			
			// Draw all touch buttons
			if (ig.ua.mobile)
			{
				this.stickLeft.draw();
				
				for( var i = 0; i < this.buttons.length; i++ )
					this.buttons[i].draw();
			}
			this.font.draw( 'Move: W,S,A,D  Jump&Shoot: Mouse Buttons', 2, 2 );
			
			//Check for screen fade
			if (this.screenFader)
				this.screenFader.draw();
		},
		
		
		/**
		 * Helpers
		 */
		getEntityById: function(id)
		{
			for(var i in this.entities)
			{
				if(this.entities[i].id === id)
					return this.entities[i];
			}
			return null;
		},
		getEntityByRemoteId: function(id)
		{
			var tEntities = this.getEntitiesByType(EntityPlayer);
			for(var i in tEntities)
			{
				if(tEntities[i].remoteId === id)
					return tEntities[i];
			}
			return null;
		},
		write: function(text, pos)
		{
			this.note.spawnNote(this.font, text, pos.x, pos.y, 
					{vel: {x: 0, y: 0},  alpha: 0.5, lifetime: 2.2, fadetime: 0.3 });
		}
		
		
	});

	//Determine resolution	
	if (ig.ua.android)
		ig.main('#canvas', MyGame, 60, 290, 140, scale);
	else if (ig.ua.iPhone4)
		ig.main('#canvas', MyGame, 60, 160, 210, scale);
	else if( ig.ua.mobile )
		ig.main('#canvas', MyGame, 60, 160, 210, scale);
	else
		ig.main('#canvas', MyGame, 60, 320, 240, scale);
});
