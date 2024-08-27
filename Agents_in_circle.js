// This is a JavaScript file that shows off agent and class use. The bouncing physics is currently unrealistic, but 
// that is an easy fix via an understanding of using Jacobians to change a coordinate basis; the raidal speed and is dependent on the agent's x and y position
// ( velocity_x, velocity_y ) --> (velocity_r, velocity_theta) --> multiply velocity_r, velocity_theta  by * 1 and pipe it back to vel.x and vel.y 

// Please view the agent in a circle demo mp4, also attached to this file


const canvasSketch = require('canvas-sketch');
const random = require("canvas-sketch-util/random")
const math = require("canvas-sketch-util/math")

//this is why we are using canvas-sketch: it is way easier to animate
const settings = {
  dimensions: [ 1080, 1080 ],
  animate: true
};

const sketch = ({context, width, height}) => {
  
  // we will spawn the agents in a manner such that it will be easy to change the amount of them
  const agents = [];
  const num_agents = 50;

  const ring_radius = 500;
 // we spawn them within the radius of the circle
  for (i = 0; i < num_agents; i++) {

    const x = random.range(1/6 * width, 5/6 *width);
    const y = random.range(1/6 * height, 5/6*height);

    agents.push(new Agent(x,y))

  }

  return ({ context, width, height }) => {
    
    context.save();
    // this creates a simple radial gradient. It will act as the edge of the ring. I will add a texture to the gardient later 
    
    const grd = context.createRadialGradient(width/2, height/2, ring_radius - 25 ,width/2, height/2, ring_radius + 25);
    grd.addColorStop(0, "#000000")
    grd.addColorStop(0.45, "#bbbbbb")
    grd.addColorStop(0.5,"#ffffff")
    grd.addColorStop(0.55, "#bbbbbb")
    grd.addColorStop(1, "#000000")
    
    context.fillStyle = grd;
    context.fillRect(0, 0, width, height);
    

    context.restore();

    context.save();
    
    context.strokeStyle = "rgba(255,255,255,0.9)"
    context.translate(width/2, height/2);
    context.beginPath();
    context.lineWidth = 10
    context.arc(0,0,ring_radius,0,2*Math.PI)
  
    
        
    context.restore();

  // this draws a line between all agents that are close enough together. Further, the closer the agents 
    
    for (i =0; i< agents.length; i++){
      const agent = agents[i];

      for (j= i+1 ; j < agents.length; j++){
        const other = agents[j];

        const dist = agent.pos.getDistance(other.pos);
        console.log(dist)

        if (dist > 300) continue;

        context.save();
        context.lineWidth = math.mapRange(dist, 0 , 300, 2, 0 , 1);
        context.strokeStyle = "rgba(200,200,200,1)"
        context.beginPath();
        context.moveTo(agent.pos.x, agent.pos.y);
        context.lineTo(other.pos.x, other.pos.y);
        
        context.stroke();
        context.restore();
      }
    }
// this updates the postion of each agent and checks to see if there is contact between agent and the ring
    agents.forEach(agent =>{
      agent.update();
      agent.draw(context);
      agent.bounce(width, height);
      agent.bounce_ring(width/2, height/2, ring_radius)
    })
  };
};


canvasSketch(sketch, settings);


class Vector{
  constructor(x, y){
    this.x = x;
    this.y = y;

  }
  getDistance(v){
    const dx = this.x - v.x;
    const dy = this.y - v.y;

    return Math.sqrt(dx**2 + dy**2)
  }
}

class Agent {
  constructor(x,y){
    this.pos = new Vector(x, y);
    this.vel = new Vector(random.range(-1, 1), random.range(-2, 2));
    this.radius = random.range(9,11);
  }
  update(){
    this.pos.x += this.vel.x;
    this.pos.y += this.vel.y;
    

  }
  bounce(width, height){
    if (this.pos.x <= 0 || this.pos.x >= width) this.vel.x *= -1;
    if (this.pos.y <= 0 || this.pos.y >= height) this.vel.y *= -1;

  }
  bounce_ring(center_x, center_y,radius){

    const translated_x = this.pos.x - center_x;
    const translate_y = this.pos.y - center_y;


    // incorrect: need to apply r/theta jacobian, invert the velocity, and then revert back to cartesian
    if (translated_x**2 + translate_y**2 >= radius**2) this.vel.x *= -1;
    if (translated_x**2 + translate_y**2 >= radius**2) this.vel.y *= -1;
 

  }
  draw(context) {
   
    
    context.save();
   
    context.beginPath();
    context.translate(this.pos.x, this.pos.y);
    const line_shadow = context.createRadialGradient(0, 0, 1, 0, 0, 10);
    line_shadow.addColorStop(0, "rgba(212, 212, 212, 1)");
    line_shadow.addColorStop(1, "rgba(255, 255, 255, 0)");
    context.arc(0, 0, this.radius, 0, Math.PI*2);
    context.fillStyle = line_shadow;
    context.fill();
    context.restore();
  }
}
