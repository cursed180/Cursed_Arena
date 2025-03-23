ig.module('plugins.client')
.requires('impact.impact')

.defines(function()
{
	ig.ImpactConnect = ig.Class.extend({
		
		init :  function(player, port)
			{
				this.remoteId;
				this.socket = io.connect();
				
				var text = "";
				
				//If jQuery hasn't successfully loaded, load Google jQuery
				if (typeof $ == 'undefined')
				{
					(function ()
					 {
						function loadScript(url, callback)
						{
						    var script = document.createElement("script")
						    script.type = "text/javascript";
					    
						    if (script.readyState) { //IE
							script.onreadystatechange = function ()
							{
							    if (script.readyState == "loaded" || script.readyState == "complete")
							    {
								script.onreadystatechange = null;
								callback();
							    }
							};
						    }
						    else
						    { //Others
							script.onload = function ()
							{
							    callback();
							};
						    }
					    
						    script.src = url;
						    document.getElementsByTagName("head")[0].appendChild(script);
						}
					    
						loadScript("https://ajax.googleapis.com/ajax/libs/jquery/1.6.1/jquery.min.js", function ()
						{
						     //jQuery loaded
						     if ($ != undefined)
						     {
							console.log('jquery loaded');
							text 		= $('#text');
						     }
						});
					})();
				}	
	
				this.socket.emit('start');
				

				// Ping to make sure our socket connection is working
				this.socket.on('ping', function (data)
				{
	
					// Modify the DOM to show the message
					document.getElementById("msg").innerHTML = data.msg;
	
					// Send a message back to the server
					this.socket.emit('pong', {msg: "Browser successfully connected via socket.io."});
				});
				
				this.socket.on('setRemoteId', function(rId)
				{
					player.remoteId = rId;
					this.remoteId = rId;
				});
				
				/**
				 * joining game
				 */
				this.socket.on('join', function(data)
				{
					if(data.remoteId != this.remoteId)
					{
						//spawn a player off screen until we know his actual position
						ig.game.spawnEntity(EntityPlayer, -1000, -1000,
							{
								handlesInput: false,
								gravityFactor: 0,
								remoteId: data.remoteId
							});
					}
				});
				
				
				/**
				 * spawns simple entity you cant control
				 * info: class comes as string and needs the eval, because socket.io strips all prototypes
				 */
				this.socket.on('spawnSimpleEntity', function(data){
					ig.game.spawnEntity(eval(data.ent), data.x, data.y, data.settings);
				});
				
				
				
				/**
				 * moving and animations
				 */
				this.socket.on('move', function(data)
				{
					try
					{
						var ent = ig.game.getEntityByRemoteId( data.remoteId );
						ent.pos.x = data.pos.x;
						ent.pos.y = data.pos.y;
						if(ent.remoteAnim != data.remoteAnim)
						{	
							var newAnim = "ent.anims."+data.remoteAnim;
							ent.currentAnim = eval(newAnim);
							
							ent.currentAnim.flip.x = data.flipped;
							ent.remoteAnim = data.remoteAnim;
						}
					}
					catch(e)
					{	
						//entity null
						console.log("caught: "+e);
					}
				});
	
	
				/**
				 * announcing some text to everyone
				 */
				this.socket.on('announced', function(data)
				{
					ig.game.write(data.text,
						{
							x: ig.system.width/4,
							y: ig.system.height/4
						});
				});
				
				/**
				 * disconnecting and removing
				 */
				this.socket.on('disconnect', function()
				{
					//disconnect logic and
					//reconnect if accidentally disconnected
				});
				
				this.socket.on('removed', function(data)
				{
					try
					{
						var ent = ig.game.getEntityByRemoteId( data.remoteId );
						ig.game.removeEntity( ent );
					}
					catch(e)
					{
						//entity null
						console.log("caught: "+e);
					}
				});
			
			},
		
		
		/**
		 * universal broadcasting method
		 */
		send: 	function(name, data)
			{
				this.socket.emit("impactconnectbroadcasting", {	name: name, data: data });
			},
		
		/**
		 * writes text on every screen
		 * font is your ig.game.font
		 */
		announce: function(data)
			  {
				this.socket.emit("announce", data);
			  }
	});
});