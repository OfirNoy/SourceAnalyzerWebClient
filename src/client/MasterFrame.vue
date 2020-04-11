<template>
  <div>
    <b-button-group id="masterMenu">
      <b-button variant="info" :pressed="isRepositoryShowing" id="repositoryButton"  @click="showTaggle('repository')">Repository</b-button>
      <b-button variant="info" :pressed="isElementsShowing" id="elementsButton" @click="showTaggle('elements')">Elements</b-button>
      <b-button variant="info" :pressed="isBuildShowing" id="buildButton" @click="showTaggle('build')">Build Order</b-button>
    </b-button-group>
    <VueDraggableResizable ref="draggableRepository" :draggable="false" :resizable="false" class-name="draggable" v-show="isRepositoryShowing" :z="100" :w="300" :h="300" :min-width="100" :min-height="100" :parent="false">
        <Repository class="fixedContent" @onLoad="onRepositoryLoad" />
    </VueDraggableResizable>  
    <VueDraggableResizable  ref="draggableElements" class-name="draggable" v-show="isElementsShowing" :z="100" :w="300" :h="300" :min-width="100" :min-height="100" :parent="false">
        <Elements class="floatingContent"/>
    </VueDraggableResizable>  
    <VueDraggableResizable  ref="draggableBuild" class-name="draggable" v-show="isBuildShowing" :z="100" :w="300" :h="300" :min-width="100" :min-height="100" :parent="false">
        <Build class="floatingContent"/>
    </VueDraggableResizable>
    <div class="status" v-if="isDownload"> 
      <div style="position:fixed;width:100%"><span>{{ message }}</span></div>
      <div><img src="img/pixelated-hourglass-loading.gif"/></div>
    </div>

    <div id="3d-graph">        
    </div>

    <!-- <div id="footerMenu">                  
      <div id="outputButton" v-bind:class="getButtonStyle('output')" @click="showTaggle('output')">Output</div>
      <div id="refreshButton" v-bind:class="getButtonStyle('refresh')" @click="refreshGraph()">Refresh Graph</div>
    </div> -->
  </div>
</template>

<script>
const Tabs = require('./TabSelector.vue').default;
const Repository = require('./DialogRepository.vue').default;
const Elements = require('./DialogElements.vue').default;
const Build = require('./DialogBuild.vue').default;

const ForceGraph = require('force-graph').default;
const Axios = require('axios').default;
const VueDraggableResizable = require('vue-draggable-resizable');
require('vue-draggable-resizable/dist/VueDraggableResizable.css');

export default {  
  components: {
    Tabs,        
    VueDraggableResizable,
    Repository,
    Elements,
    Build
  },
  data() {
    return {   
        isDownload: false,
        isRepositoryShowing: false,
        isElementsShowing: false,
        isBuildShowing: false,
        repositoryButtonStyle: 'tbbutton tbunselected',
        elementsButtonStyle: 'tbbutton tbunselected',
        buildButtonStyle: 'tbbutton tbunselected',
        graph: ForceGraph(),
        branchList: [],
        pollInterval: null,
        message: ""
    }
  },  
  mounted(){    
    this.resetDraggableRepositoryBox();
    this.resetDraggableElementsBox();
    this.resetDraggableBuildBox();     
  },
  computed: {
        repositoryContent(){
            var str = "Select Repository";            
            return str;
        },
        elementsContent(){
            var str = "Select elements";            
            return str;
        },
        buildContent(){
            var str = "View Build Order";            
            return str;
        }
    },     
  methods: {    
    onRepositoryLoad(url){    
      var encodedUrl = encodeURIComponent(url);        
      console.log(`Analyzing ${encodedUrl}`);
      Axios.get(`analyzer/${encodedUrl}`)
        .then((response) => {                      
          if(response.status == 202 && this.pollInterval == null){
            this.drawGraph({nodes:[], links:[]});//Clear graph
            console.log('Server is processing, start polling');
            this.isDownload = true;
            this.pollInterval = setInterval(function () {
                this.onRepositoryLoad(url);
            }.bind(this), 3000);            
            setTimeout(() => {
              console.log('Timeout: Stop polling');
              clearInterval(this.pollInterval); 
              this.pollInterval = null;
              this.message = "Stopped polling, no data received";
            }, 36000000); //stop polling after an hour
          }
          else if(response.status == 200){
            this.isDownload = false;
            this.message = "";
            console.log('Graph received');
            clearInterval(this.pollInterval);
            this.pollInterval = null;
            this.drawGraph(response.data);
          }
          else{
            console.log(`${response.status}: ${response.data.message}`);
            this.message = response.data.message;
          }
        })
        .catch(err => {
          console.error(`Call to analyzer failed with: ${err}`);
        });
    },
    drawGraph(data){
      this.graph(document.getElementById('3d-graph'))           
          .linkDirectionalArrowLength(4.5)
          .linkDirectionalArrowRelPos(1)
          .linkDirectionalParticles(1)
          .nodeLabel('id')
          .nodeAutoColorBy('type')
          // .nodeCanvasObject((node, ctx, globalScale) => { 
          //     //console.log(node);
          //     Create2DObject(ctx, node);
          //    //SetText(ctx, node, globalScale);
          //     ctx.fill();
          // })           
          .graphData(data);
          //Graph.d3Force('charge').strength(-250);  
    },
    // onRepositoryLoad(repoUrl){
    //   var url = Buffer.from(repoUrl).toString('base64');  
    //   this.isDownload = true;  
    //   Axios.get(`repositories/branches/${url}`).then((response) => {      
    //     this.branchList = response.data;
    //     this.isDownload = false;
    //   });      
    //},
    setGraphText(ctx, node, globalScale){
        const label = node.name;
        const fontSize = 12/globalScale;       
        const textWidth = ctx.measureText(label).width;
        const bckgDimensions = [textWidth, fontSize].map(n => n + fontSize * 0.2); // some padding       
        var radius = 8;
        if(node.group == "Exe"){
            radius = 10;
        }
        ctx.font = `${fontSize}px Sans-Serif`;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.fillRect(node.x - bckgDimensions[0] / 2, node.y - bckgDimensions[1] / 2, ...bckgDimensions);
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = colors[node.group];
        ctx.fillText(label, node.x , node.y - radius);
    },
    createGraph2DObject(ctx, node){
        //console.log(node);
        ctx.fillStyle = colors[node.group];
        ctx.beginPath();
        var radius = 5; 
        if(node.group == "Exe"){
            radius = 7;
            ctx.arc(node.x, node.y, 7, 0, 2 * Math.PI, false);
        }else{                    
            ctx.arc(node.x, node.y, 5, 0, 2 * Math.PI, false);
        }
    },
    setDraggablePosition(draggable, rect, width, height){      
      draggable.rawLeft = rect.left + ((rect.right - rect.left)/2 - width/2);
      draggable.rawTop = rect.bottom;      
      draggable.rawHeight = height;
      draggable.rawWidth = width;
      draggable.rawRight = draggable.parentWidth - draggable.rawWidth - draggable.rawLeft;
      draggable.rawBottom = draggable.parentHeight - draggable.rawHeight - draggable.rawTop ;
    },
    resetDraggableRepositoryBox(){      
      this.setDraggablePosition(this.$refs.draggableRepository, document.getElementById("repositoryButton").getBoundingClientRect(), 400, 120);
    },
    resetDraggableElementsBox(){
      this.setDraggablePosition(this.$refs.draggableElements, document.getElementById("elementsButton").getBoundingClientRect(), 300, 300);
    },
    resetDraggableBuildBox(){
      this.setDraggablePosition(this.$refs.draggableBuild, document.getElementById("buildButton").getBoundingClientRect(), 300, 300);
    },
    getStyle(selected){
      if(selected){
          return 'tbbutton tbselected';
        }        
        return 'tbbutton tbunselected';
    },
    getButtonStyle(key){
      if(key === 'repository'){
        return this.getStyle(this.isRepositoryShowing);
      }
      if(key === 'elements'){
        return this.getStyle(this.isElementsShowing);
      }
      if(key === 'build'){
        return this.getStyle(this.isBuildShowing);
      }
      return '';
    },
    showTaggle(key){
      if(key === 'repository'){
        if(!this.isRepositoryShowing){          
          this.resetDraggableRepositoryBox();
        }
        this.isRepositoryShowing = !this.isRepositoryShowing;        
      }
      else if(key === 'elements'){
        if(!this.isElementsShowing){          
          this.resetDraggableElementsBox();
        }
        this.isElementsShowing = !this.isElementsShowing;
      }
      else if(key === 'build'){
        if(!this.isBuildShowing){          
          this.resetDraggableBuildBox();
        }
        this.isBuildShowing = !this.isBuildShowing;
      }      
    }
  }
};

</script>

<style>
#masterMenu{
  top: 0px;
  position: fixed;
  z-index: 900;
  height: 50px;
  width: 100%;
  display: flex;
  justify-content: center;
}
.status{
  top: 180px;
  left: 250px;
  position: fixed;  
  display: flex;  
}
.tbbutton {
  width: 300px;
  height: 50px;  
  border-style: solid;
  border-color: blueviolet;
}
.tbbutton.tbselected {  
  background-color: #c2d3ed;   
}
.tbbutton.tbunselected {  
  background-color: #f2f4f7;    
}
.fixedContent{
  width: 100%;
  height: 100%;       
  border-radius: 0.6rem;  
  background-color: rgb(199, 241, 248);
  overflow-y: auto;
  overflow-x: auto; 
}
.floatingContent{     
    width: 100%;
    height: 100%;       
    border-radius: 0.6rem;
    box-shadow: 0 0 1em black;
    background-color: white;   
    overflow-y: auto;
    overflow-x: auto; 
}
.draggable{
  position: fixed;
}
</style>
