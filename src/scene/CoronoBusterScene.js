import Phaser from "phaser";
import FallingObject from "../ui/FallingObject";
import Laser from "../ui/Laser.";
export default class CoronaBusterScene extends Phaser.Scene{
    constructor(){
        super('corona-buster-scene')
    }

    init(){
        this.clouds = undefined;
        

        // //inisiasi Tombol
        this.nav_left = false;
        this.nav_right = false;
        this.shoot = false;

        // // //inisiasi keyboard
        this.cursor = undefined

        // //inisiasi player
        this.player = undefined
        this.speed = 100 

        // Inisiasi Enemy
        this.enemies = undefined
        this.enemySpeed = 50;

        // // Inisiasi Laser
        this.lasers = undefined
        this.lastFired = 10
    }

    preload(){
        this.load.image('background', 'images/bg_layer1.png')
        this.load.image('cloud', 'images/cloud.png')

        this.load.image('left-btn', 'images/left-btn.png')
        this.load.image('right-btn', 'images/right-btn.png')
        this.load.image('shoot-btn', 'images/shoot-btn.png')

        // //upload enemy
        this.load.image('enemy', 'images/enemy.png')

        //Upload Laser enemy 
        this.load.spritesheet('laser', 'images/laser-bolts.png',{
            frameWidth: 16,
            frameHeight: 16,
        })

        // upload player
        this.load.spritesheet('player', 'images/ship.png',{
            frameWidth: 66, frameHeight: 66
        })
    }

    create(){
        const gameWidth = this.scale.width*0.5;
        const gameHeight = this.scale.height*0.5;
        this.add.image(gameWidth, gameHeight, 'background')

        // display cloud
        this.clouds = this.physics.add.group({
            key: 'cloud',
            repeat: 10,
        })

        Phaser.Actions.RandomRectangle(
            this.clouds.getChildren(),
            this.physics.world.bounds
        )

        //display control button
        this.createButton()

        // // Untuk control player dengan keyboard
        this.cursor = this.input.keyboard.createCursorKeys()

        // //display Player
        this.player = this.createPlayer()

        // // //display enemies
        this.enemies = this.physics.add.group({
            classType: FallingObject,
            maxSize: 10,
            runChildUpdate: true
        })
        this.time.addEvent({
            delay: Phaser.Math.Between(1000,5000),
            callback: this.spawnEnemy,
            callbackScope: this,
            loop: true
        })

        // // //Display Laser
        this.laser = this.physics.add.group({
            classType: Laser,
            maxSize: 10,
            runChildUpdate: true
        })

        // // //ketika laser bertemu dengan enemy
        // this.physics.add.overlap {
        //     this.laser,
        //     this.enemies,
        //     this.hitEnemy,
        //     null,
        //     this
        // }
    }

    update(time){
        this.clouds.children.iterate((child) => {
            // @ts-ignore
            child.setVelocityY(20)
            if(child.y > this.scale.height){
                child.x = Phaser.Math.Between(10, 400)
                child.y = 0;
            }
        })
        // //panggil method movePlayer untuk control pesawat
        this.movePlayer(this.player, time)
    }

    //Method untuk menambahkan Tombol navigasi
    createButton(){
        this.input.addPointer(3)

        let shoot = this.add.image(320, 550, 'shoot-btn')
        .setInteractive()
        .setDepth(0.5)
        .setAlpha(0.8)

        let nav_left = this.add.image(50, 550, 'left-btn')
        .setInteractive()
        .setDepth(0.5)
        .setAlpha(0.8)

        let nav_right = this.add.image(
        nav_left.x + nav_left.displayWidth+20, 550, 'right-btn')
        .setInteractive()
        .setDepth(0.5)
        .setAlpha(0.8)

        //Ketika tombol diklik
        //Navigation left
        nav_left.on('pointerdown', () => {
            this.nav_left = true
        }, this)
        nav_left.on('pointerout', () => {
            this.nav_left = false
        }, this)

        //Config right
        nav_right.on('pointerdown', () => {
            this.nav_right = true
        }, this)
        nav_right.on('pointerout', () => {
            this.nav_right = false
        }, this)

        //config shoot
        shoot.on('pointerdown', () => {
            this.shoot = true
        }, this)
        shoot.on('pointerout', () => {
            this.shoot = false
        }, this)
    }

    //Method untuk menambahkan player
    createPlayer(){
        const player = this.physics.add.sprite(200, 450,  'player')
        player.setCollideWorldBounds(true)

        // Adjust animation for player and frame 
        this.anims.create({
            key: 'turn',
            frames: [{
                key: 'player',
                frame: 0
            }]
        })
        this.anims.create({
            key: 'left',
            frames: this.anims.generateFrameNames('player', {
                start: 1,
                end: 2 
            }),
        })
        this.anims.create({
            key: 'right',
            frames: this.anims.generateFrameNames('player', {
                start: 1,
                end: 2 
            }),
        })
        return player
    }

    // Method unttuk mengendalikan player
    movePlayer(player, time){
        if(this.cursor.left.isDown || this.nav_left){
            this.player.setVelocityX(this.speed * -1)
            this.player.anims.play('left', true)
            this.player.setFlipX(false)
        } else if (this.cursor.right.isDown || this.nav_right) {
            this.player.setVelocityX(this.speed)
            this.player.anims.play('right', true)
            this.player.setFlipX(true)
        } else {
            this.player.setVelocityX(0)
            this.player.anims.play('turn')

        }
        if((this.shoot) && time > this.lastFired){
            const laser = this.lasers.get(0, 0, 'laser')
            if(laser) {
                laser.fire(this.player.x, this.player.y)
                this.lastFired = time + 150
            }
        }
    }

    // Method untuk menampilkan enemy dan clone nya
    spawnEnemy(){
        const config = {
            speed: 50,
            rotation: 0.1 
        }
        // @ts-ignore
        const enemy = this.enemies.get(0, 0, 'enemy', config)
        const positionX = Phaser.Math.Between(50, 350)
        if(enemy) {
            enemy.spawn(positionX)
        }
    }

    //Method ketika player menabrak enemy
    hitEnemy(Laser, enemy){
        Laser.die()
        enemy.die()
    }
}