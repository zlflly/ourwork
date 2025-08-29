class Noel extends Entity{
	static BufferTime=3;
	static RunSpeed=6;
	static DashSpeed=12;
	static CoyoteTime=10;
	static DashTime=24;
	static JumpSpeed=-16;
	static JumpHBoost=4;
	static Gravity=1.6;
	static LowGravityThreshold=4;
	static FallSpeed=10;
	static FastFallMul=1.5;
	
	static animationSpeed={
		'stand':6,
		'walk':8,
		'run':9,
		'jump':16,
		'jump2':8,
		'fall':8,
		'fall2':8
	};
	
	constructor(s1,s2){
		let size=new Vector(40,100);
		s1.scale.set(0.7,0.7);
		s2.scale.set(0.7,0.7)
		let animationMachine=new AnimationMachine(s1,s2);
		super(size,animationMachine);
		this.anchor.set(0.5,1.0);
		this.animationMachine.changeAnimation('stand');
		
		this.blockEvent=false;
		this.coyoteTimer=0;
		this.dash=1;
		this.dashTimer=0;
		this.dashShadow=[];
		this.status="normal";
	}
	async loadHintImg(){
		let img=await game.dataManager.loadImg('img/point.png');
		this.interactionHint=img;
	}
	//人物是否位于地面
	isOnGround(){
		let hitbox=this.hitbox;
		let rect=new Rect(hitbox.position.add(0,1),hitbox.size);
		let hitboxes=game.mapManager.getCollidable();
		for(let i of hitboxes){
			if(rect.containsRect(i)){
				return true;
			}
		}
		return false;
	}
	//更新人物的状态
	update(delta){
		this.updateAnimation(delta);
		if(!game.eventManager.event)this.checkEvent();
		switch(this.status){
		case "normal":
			this.updateNormal(delta);
			break;
		case "dash":
			this.updateDash(delta);
			break;
		}
		
		//移动人物，如果发生碰撞，则清零对应方向速度
		this.rigidMove(this.velocity,game.mapManager.getCollidable(),(function(contactSide){
			if(contactSide=='H'){
				this.velocity.x=0;
				this.remainder.x=0;
			}else if(contactSide=='V'){
				this.velocity.y=0;
				this.remainder.y=0;
			}
		}).bind(this));
	}
	//计算人物的移动速度
	updateNormal(delta){
		let onGround=this.isOnGround();
		let machine=this.animationMachine;
		let v=this.velocity;
		let moveX=game.inputManager.getMoveX();
		let moveY=game.inputManager.getMoveY();
		let jump=game.inputManager.getJump();
		let dash=game.inputManager.getDash();
		
		//如果有事件在进行，覆盖掉按键输入
		if(this.blockMove){
			moveX=0;
			moveY=0;
			jump=0;
			dash=0;
		}
		
		//处理冲刺
		if(game.saveManager.data.canDash&&dash&&game.gameFrame-dash.timeStamp<=Noel.BufferTime&&this.dash>0){
			this.dash--;
			this.status="dash";
			this.dashTimer=Noel.DashTime;
			this.updateDash();
			return;
		}
		
		//处理水平移动
		if(moveX!=0){
			this.facing=moveX;
			if(Math.abs(v.x)<=Noel.RunSpeed){
				v.x=moveX*Math.min(Math.sqrt(v.x*v.x+6),Noel.RunSpeed);
			}else if(onGround){
				v.x-=(v.x-Noel.RunSpeed*moveX)*0.05;
			}else{
				v.x=Math.max(v.x*moveX-0.06,Noel.RunSpeed)*moveX;
			}
			if(onGround&&machine.current!='run'){
				machine.changeAnimation('run');
			}
		}else{
			v.x*=Math.exp(-1.57);
			if(Math.abs(v.x)<0.05*Noel.RunSpeed){
				v.x=0;
				if(onGround&&machine.current!='stand'){
					machine.changeAnimation('stand');
				}
			}
		}
		
		//重置土狼计时器与冲刺，处理跳跃
		if(onGround){
			this.coyoteTimer=Noel.CoyoteTime;
			this.dash=1;
		}
		if(jump){
			if(game.gameFrame-jump.timeStamp<=Noel.BufferTime&&this.coyoteTimer>0){
				this.coyoteTimer=0;
				v.y=Noel.JumpSpeed;
				v.x+=Noel.JumpHBoost*moveX;
				machine.changeAnimation('jump');
			}
		}
		
		//处理下落
		if(!onGround){
			this.coyoteTimer=Math.max(this.coyoteTimer-1,0);
			
			let Gravity=Noel.Gravity;
			if(v.y<=Noel.LowGravityThreshold&&jump){
				Gravity/=2;
			}
			let FallSpeed=Noel.FallSpeed;
			if(moveY==1){
				FallSpeed*=Noel.FastFallMul;
			}
			v.y=Math.min(v.y+Gravity,FallSpeed);
			if(v.y>0&&['fall','fall2'].indexOf(machine.current)==-1){
				machine.changeAnimation('fall');
			}
		}
	}
	updateDash(delta){
		let onGround=this.isOnGround();
		let machine=this.animationMachine;
		let v=this.velocity;
		let moveX=game.inputManager.getMoveX();
		let moveY=game.inputManager.getMoveY();
		let jump=game.inputManager.getJump();
		this.dashTimer--;
		
		if(this.dashTimer>=18){
			v.set(0,0);
			return;
		}
		if(this.dashTimer==17){
			if(machine.current!="run")machine.changeAnimation("run");
			if(onGround&&moveY==1)moveY=0;
			if(moveX==0)moveX=this.facing;
			this.facing=moveX;
			v.x=Noel.DashSpeed*moveX;
			v.y=Noel.DashSpeed*moveY/1.2;
		}
		
		moveX=this.facing;
		//重置土狼计时器与冲刺，处理跳跃
		if(onGround){
			this.coyoteTimer=Noel.CoyoteTime;
			if(this.dashTimer<=5)this.dash=1;
		}else{
			this.coyoteTimer=Math.max(this.coyoteTimer-1,0);
		}
		if(jump){
			if(game.gameFrame-jump.timeStamp<=Noel.BufferTime&&this.coyoteTimer>0){
				this.coyoteTimer=0;
				this.dashTimer=0;
				v.y+=Noel.JumpSpeed;
				v.x+=Noel.JumpHBoost*moveX;
				machine.changeAnimation('jump');
			}
		}
		
		if(this.dashTimer==0){
			this.status='normal';
		}
	}
	//按设定的速度控制人物动画的播放
	updateAnimation(delta){
		let machine=this.animationMachine;
		if(machine.timer>1){
			if(this.status=="dash"){
				this.dashShadow.push({
					"pos":new Vector(this.position),
					"frame":machine.currentFrame,
					"inverted":this.facing==1,
					"time":15
				});
			}
			machine.timer--;
			let animation=machine.spritesheet.animations[machine.current];
			//当前动画播放结束时，判断应该循环播放还是切换动画
			if(machine.currentFrame==animation.length-1){
				switch(machine.current){
					case 'jump':
					machine.changeAnimation('jump2');
					break;
					case 'fall':
					machine.changeAnimation('fall2');
					break;
					default:
					machine.currentFrame=0;
					break;
				}
			}else{
				machine.currentFrame++;
			}
		}
		machine.timer+=Noel.animationSpeed[machine.current]/60;
	}
	//检查是否应触发事件
	checkEvent(){
		let hitbox=this.hitbox;
		let negativeEvent=false;
		let canInteract=false;
		for(let i of game.mapManager.events){
			if(hitbox.containsRect(i)&&game.saveManager.checkFilter(i.event)){
				if(i.event.trigger=='negative'){
					negativeEvent=true;
					if(!this.blockEvent){
						game.eventManager.set(i.event);
						this.blockEvent=true;
						return;
					}
				}else if(i.event.trigger=='positive'){
					if(game.inputManager.getInteraction()){
						game.eventManager.set(i.event);
						this.blockEvent=true;
						return;
					}else{
						canInteract=true;
					}
				}
			}
		}
		if(!negativeEvent)this.blockEvent=false;
		this.canInteract=canInteract;
	}
	draw(){
		for(let i=0;i<this.dashShadow.length;i++){
			let shadow=this.dashShadow[i];
			let pos=game.camera.getDrawPos(shadow.pos.sub(34,102));
			this.animationMachine.drawShadow(pos,shadow.frame,shadow.inverted);
			shadow.time--;
			if(shadow.time==1)this.dashShadow.splice(i--,1);
		}
		
		let pos=game.camera.getDrawPos(this.position.sub(34,102));
		this.animationMachine.draw(pos,this.facing==1);
		
		if(this.canInteract&&!game.eventManager.event){
			let pos=game.camera.getDrawPos(this.position.sub(11,152));
			game.ctx.drawImage(this.interactionHint,pos.x,pos.y);
		}
	}
}