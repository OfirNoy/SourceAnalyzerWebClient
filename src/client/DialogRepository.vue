<template>        
    <div id="repository">
        <b-input-group prepend="Repo URL:" size="sm">
            <b-form-input v-model="repository" size="sm" type="text" placeholder="URL to Git repository"/><b-button size="sm" variant="info" v-on:click="onLoad">Load</b-button>
        </b-input-group>        
        <!-- <b-dropdown id="branches" v-bind:text="selectedBranch" variant="primary" class="m-2 scrollable-menu">
            <b-dropdown-item-button @click="selectedBranch = item" v-for="item in this.BranchList" :key="item">
                {{ item }}
            </b-dropdown-item-button> -->
        </b-dropdown>
    </div>     
</template>

<script>

export default {  
    props: {
        BranchList: Array
    }, 
    data() {
        return { 
            repository: '',
            selectedBranch: 'Branches'
        }
    },
    components: { 
    },
    watch: {        
        selectedBranch: function (newBranch, oldBranch) {
            if(newBranch != oldBranch){
                this.onBranchSelected();
            }
        }
    },
    methods:{        
        onBranchSelected(){
            if(this.repository != "" && this.selectedBranch != ""){
                this.$emit('onBranch', this.repository, this.selectedBranch);                
            }
        },
        onLoad(){
            if(this.repository != ""){
                this.$emit('onLoad', this.repository);                
            }
        }
    }
}
</script>

<style>
#repository{
    padding: 25px 20px 0px 25px;
}
</style>
