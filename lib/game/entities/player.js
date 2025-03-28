ig.module(
	'game.entities.player'
)
.requires(
	'impact.entity'
)
.defines(function(){

EntityPlayer = ig.Entity.extend({

    collides: ig.Entity.COLLIDES.PASSIVE,
    type: ig.Entity.TYPE.A,
    //checkAgainst: ig.Entity.TYPE.B,

	maxVel: {x: 100, y: 200},
	friction: {x: 600, y: 0},
	
    size: {x: 8, y:14},
	offset: {x: 4, y: 2},
	
    health: 20,
    
    lastX: -1,
    lastY: -1,
    
    
    animSheet: new ig.AnimationSheet( 'media/player.png', 16, 16 ),
    
    handlesInput: true,
    
    flipped: false,
    
    init: function( x, y, settings ) {
        
        this.parent( x, y, settings );
        ig.merge(this, settings);
        
        this.addAnim( 'idle', 1, [0,1,0] );
		this.addAnim( 'run', 0.07, [0,1,2,3,4,5] );
		this.addAnim( 'jump', 1, [9] );
		this.addAnim( 'fall', 0.4, [6,7] );
		
		this.remoteAnim = "idle";
		
    },
    
    update: function() {
        this.parent(); 
        
        if(this.handlesInput){
        	this.initKeys();
        }
        
    },
    
    broadcastPosition: function(){
    	ig.game.gamesocket.send('move', {
    		pos: this.pos,
    		remoteAnim: this.remoteAnim,
    		remoteId: this.remoteId,
    		flipped: this.flipped
    	});
    },
    
    initKeys: function(){
	var accel = 100;
	
	if( ig.ua.mobile )
	{
    	    // left stick - move
	    this.accel.x = ig.game.stickLeft.input.x * accel;
	    //this.accel.y = ig.game.stickLeft.input.y * accel;
	    if(this.accel.x < 0)
		this.flipped = true;
	    if (this.accel.x > 0)
		this.flipped = false;
	}
	else
	{
	        if(ig.input.state('left') )
		{
		    this.accel.x = -accel;
		    this.flipped = true;
		}
		else if(ig.input.state('right') )
		{
			this.accel.x = accel;
			this.flipped = false;
		}
		else
		{
			this.accel.x = 0;
		}
	}
	if( ig.input.pressed('jump') )
	{
			this.vel.y = -100;
	}
		
	if( ig.input.pressed('shoot') )
	{
			ig.game.spawnEntity( EntityProjectile, this.pos.x, this.pos.y, {flipped: this.flipped} );
			ig.game.gamesocket.send('spawnSimpleEntity', {
					ent: "EntityProjectile",
					x: this.pos.x,
					y: this.pos.y,
					settings: {flipped: this.flipped}
				});
	}
        
        // animations
        if( this.vel.y < 0 )
	{
			this.currentAnim = this.anims.jump;
			this.remoteAnim = "jump";
	}
	else if( this.vel.y > 0 )
	{
			this.currentAnim = this.anims.fall;
			this.remoteAnim = "fall";
	}
	else if( this.vel.x != 0 )
	{
			this.currentAnim = this.anims.run;
			this.remoteAnim = "run";
	}
	else
	{
	    this.currentAnim = this.anims.idle;
	    if(this.remoteAnim != "idle")
	    {
				this.remoteAnim = "idle";			
	    }
	}
	this.currentAnim.flip.x = this.flipped;
	
	if (this.lastX == -1 || this.lastY == -1 || (this.lastX != this.pos.X && this.vel.X != 0 && this.lastY != this.pos.Y && this.vel.Y != 0))
	{
	    lastX = this.pos.X;
	    lastY = this.pos.Y;
	    this.broadcastPosition();
	}
    },
    
    kill: function(){
    	this.pos.x = 40;
    	this.pos.y = 64;
    	ig.game.gamesocket.announce({text: this.remoteId+" got killed!"});
    	this.health = 20;
    	//this.parent();
    },
    
    handleMovementTrace: function( res ) {
        this.parent(res); 
    }

});



EntityProjectile = ig.Entity.extend({
	size: {x: 4, y: 4},
	gravityFactor: 0,
	
	collides: ig.Entity.COLLIDES.PASSIVE,
	checkAgainst: ig.Entity.TYPE.A,
	
	speed: 150,
		
	animSheet: new ig.AnimationSheet( 'media/bullet1.png', 4, 4 ),	
	
	init: function( x, y, settings ) {
		
		ig.merge(settings);
		var spawnPointAdjustmentX = (settings.flipped)?-6:6;
		this.parent( x+spawnPointAdjustmentX, y+6, settings );
		
		this.addAnim( 'idle', 1, [0] );
		this.maxVel.x = 200;
		
		this.currentAnim.flip.x = settings.flipped;
		this.vel.x = (settings.flipped)?-this.speed:this.speed;
		
	},
		
	handleMovementTrace: function( res ) {
		this.parent( res );
		if( res.collision.x || res.collision.y ) {
			this.kill();
		}
	},
	
	check: function( other ) {
		other.receiveDamage( 10, this );
		this.kill();
	}
	
});










});

   
