importScripts('js/oimo/runtime_min.js');
//importScripts('js/oimo/oimo_rev.js');
importScripts('js/oimo/oimo_rev_min.js');
importScripts('js/oimo/demo.js');

/*
OimoPhysics alpha rev 10
@author Saharan _ http://el-ement.com
@link https://github.com/saharan/OimoPhysics
...
Compact engine for three.js by Loth

OimoPhysics use international system units
0.1 to 10 meters max for dynamique body

size and position x100 for three.js
*/
var version = "10.REV";
// main class
var World, RigidBody, BruteForceBroadPhase, SweepAndPruneBroadPhase;
var Shape, ShapeConfig, BoxShape, SphereShape, CylinderShape;
var Joint, JointConfig, HingeJoint, Hinge2Joint, BallJoint, DistanceJoint;
var Vec3, Quat, Mat33, Mat44;

// physics variable
var scale = 100;
var world;
var bodys;
var N = 100;
var dt = 1/60;
var iterations = 8;
var info = "info test";
var fps=0, time, time_prev=0, fpsint = 0;
var timeint = 0;
var ToRad = Math.PI / 180;

var matrix;
var sleeps;
var types;
var sizes;
var infos =[];
var Gravity = -10;
var newGravity = -10;

var currentDemo = 0;
var maxDemo = 4;
//var isDemo = false;
//var matrix = new Float32Array(N*12);

self.onmessage = function (e) {
    var phase = e.data.tell;
    if(phase === "INITWORLD"){
        dt = e.data.dt;
        iterations = e.data.iterations;
        initClass();
    }

    else if(phase === "UPDATE"){
        newGravity = e.data.G;
        update();
    } 

    else if(phase === "CLEAR"){
        clearWorld();
    }

    else if(phase === "NEXT"){
        initNextDemo();
    }

    else if(phase === "PREV"){
        initPrevDemo();
    }
}

function update() {
    world.step();

    var t01 = Date.now();
    var r, p, t, n;
    var max = bodys.length;

    for ( var i = 0; i !== max ; ++i ) {
        if( bodys[i].sleeping) sleeps[i] = 1;
        else{ 
            sleeps[i] = 0;
            r = bodys[i].rotation;
            p = bodys[i].position;
            n = 12*i;
            matrix[n+0]=r.e00; matrix[n+1]=r.e01; matrix[n+2]=r.e02; matrix[n+3]=p.x;
            matrix[n+4]=r.e10; matrix[n+5]=r.e11; matrix[n+6]=r.e12; matrix[n+7]=p.y;
            matrix[n+8]=r.e20; matrix[n+9]=r.e21; matrix[n+10]=r.e22; matrix[n+11]=p.z;
        }
    }
    var t02 = Date.now();

    if(Gravity!==newGravity){
        Gravity = newGravity;
        world.gravity = new Vec3(0, Gravity, 0);
        for ( var i = 0; i !== max ; ++i ) bodys[i].awake();
    }

    timeint = t02-t01;
    fpsUpdate();
    worldInfo();

    self.postMessage({tell:"RUN", infos: infos, matrix:matrix, sleeps:sleeps  })
}

function worldInfo() {
    infos[0] = world.numRigidBodies;
    infos[1] = world.numContacts;
    infos[2] = world.numShapes;
    infos[3] = world.numJoints;
    infos[4] = world.numIslands;
    infos[5] = world.performance.broadPhaseTime;
    infos[6] = world.performance.narrowPhaseTime ;
    infos[7] = world.performance.solvingTime;
    infos[8] = world.performance.updatingTime;
    infos[9] = world.performance.totalTime;
    infos[10] = fpsint;
    infos[11] = timeint;
    infos[12] = 0;
    infos[13] = currentDemo;
}

function fpsUpdate(){
    time = Date.now();
    if (time - 1000 > time_prev) {
        time_prev = time; fpsint = fps; fps = 0;
    } fps++;
}


function initClass(){
    with(joo.classLoader) {
        import_("com.element.oimo.physics.OimoPhysics");
        complete(function(imports){with(imports){
            World = com.element.oimo.physics.dynamics.World;
            RigidBody = com.element.oimo.physics.dynamics.RigidBody;
            BruteForceBroadPhase = com.element.oimo.physics.collision.broad.BruteForceBroadPhase;
            SweepAndPruneBroadPhase = com.element.oimo.physics.collision.broad.SweepAndPruneBroadPhase;
            // Shape
            Shape = com.element.oimo.physics.collision.shape.Shape;
            ShapeConfig = com.element.oimo.physics.collision.shape.ShapeConfig;
            BoxShape = com.element.oimo.physics.collision.shape.BoxShape;
            SphereShape = com.element.oimo.physics.collision.shape.SphereShape;
            CylinderShape = com.element.oimo.physics.collision.shape.CylinderShape;
            // Joint
            Joint = com.element.oimo.physics.constraint.joint.Joint;
            JointConfig = com.element.oimo.physics.constraint.joint.JointConfig;
            HingeJoint = com.element.oimo.physics.constraint.joint.HingeJoint;
            Hinge2Joint = com.element.oimo.physics.constraint.joint.Hinge2Joint;
            BallJoint = com.element.oimo.physics.constraint.joint.BallJoint;
            DistanceJoint = com.element.oimo.physics.constraint.joint.DistanceJoint;
            // Math
            Vec3 = com.element.oimo.math.Vec3;
            Quat = com.element.oimo.math.Quat;
            Mat33 = com.element.oimo.math.Mat33;
            Mat44 = com.element.oimo.math.Mat44;

            initWorld();
        }});
    }
}

function initWorld(){
    if(world==null){
        world = new World();
        world.numIterations = iterations;
        world.timeStep = dt;
        world.gravity = new Vec3(0, Gravity, 0);
    }
    //startOimoTest();

    sleeps = [];
    infos = [];

    initDemo();
}

function initNextDemo(){
    clearWorld();
    currentDemo ++;
    if(currentDemo == maxDemo)currentDemo=0;
    initDemo();
}

function initPrevDemo(){
    clearWorld();
    currentDemo --;
    if(currentDemo < 0)currentDemo=maxDemo-1;
    initDemo();
}

function initDemo(){

    bodys = [];
    types = [];
    sizes = [];
    matrix = [];

    if(currentDemo==0)demo0();
    else if(currentDemo==1)demo1();
    else if(currentDemo==2)demo2();
    else if(currentDemo==3)demo3();

    matrix.length = 12*bodys.length;
    
    self.postMessage({tell:"INIT", types:types, sizes:sizes, demo:currentDemo });
}

function clearWorld(){
    var i;
    var max = world.numRigidBodies;
    for (i = max - 1; i >= 0 ; i -- ) world.removeRigidBody(world.rigidBodies[i]);
    max = world.numJoints;
    for (i = max - 1; i >= 0 ; i -- ) world.removeJoint(world.joints[i]);
    
    sleeps = [];
    infos = [];

    self.postMessage({tell:"CLEAR"});
}

//--------------------------------------------------
//    BASIC OBJECT
//--------------------------------------------------

function addRigid(obj){
    var p = obj.pos || [0,0,0];
    var s = obj.size || [1,1,1];
    var r = obj.rot || [0,0,0,0];
    var move = obj.move || false;
    var sc = obj.sc || new ShapeConfig();
    var t; 
    var shape;
    sc.position.init(p[0], p[1], p[2]);
    sc.rotation.init();
    switch(obj.type){
        case "sphere": shape=new SphereShape(s[0], sc); t=1; break;
        case "box": shape=new BoxShape(s[0], s[1], s[2], sc); t=2; break;
        case "cylinder": shape=new CylinderShape(s[0], s[1], sc); t=3; break;
        case "dice": shape=new BoxShape(s[0], s[1], s[2], sc); t=4; break;
    }
    var body = new RigidBody(r[0]*ToRad, r[1], r[2], r[3]);
    body.addShape(shape);
    if(!move)body.setupMass(0x1);
    else{ 
        body.setupMass(0x0);
        bodys.push(body);
        types.push(t);
        sizes.push([s[0]*scale, s[1]*scale, s[2]*scale]);
    }
    world.addRigidBody(body);
    return body;
}

//--------------------------------------------------
//    BASIC JOINT
//--------------------------------------------------

function addJoint(obj){
    var jc = new JointConfig();
    var ax1 = obj.ax1 || [1,0,1];
    var ax2 = obj.ax2 || [1,0,1];
    var pos1 = obj.pos1 || [0,0,0];
    var pos2 = obj.pos2 || [0,0,0];
    var minDistance = obj.minDistance || 0.01;
    var maxDistance = obj.maxDistance || 0.1;
    var type = obj.type || "hinge";
    jc.allowCollision=true;
    jc.localAxis1.init(ax1[0], ax1[1], ax1[2]);
    jc.localAxis2.init(ax2[0], ax2[1], ax2[2]);
    jc.localRelativeAnchorPosition1.init(pos1[0], pos1[1], pos1[2]);
    jc.localRelativeAnchorPosition2.init(pos2[0], pos2[1], pos2[2]);

    var joint;
    switch(type){
        case "distance": joint = new DistanceJoint(obj.body1, obj.body2, maxDistance,jc); break;
        case "hinge": joint = new HingeJoint(obj.body1, obj.body2, jc); break;
    }
    
   // joint.limitMotor.setSpring(2, 0.5); // soften the joint
    world.addJoint(joint);
    return joint;
}