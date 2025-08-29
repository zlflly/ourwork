class Spritesheet{
	constructor(json,img){
		this.scale=new Vector(1,1);
		this.json=json;
		this.frames=json.frames;
		this.animations=json.animations;
		this.img=img;
	}
	draw(key,pos,inverted=false){
		let frame=this.json.frames[key];
		let {x,y,w,h}=frame.frame;
		if(inverted){
			let w2=this.img.width;
			x=w2-x-w;
		}
		game.ctx.drawImage(
			this.img,x,y,w,h,
			pos.x,pos.y,
			w*this.scale.x,h*this.scale.y);
	}
}