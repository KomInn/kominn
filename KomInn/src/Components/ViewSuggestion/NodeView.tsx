import * as React from "react";
import { Row, Col } from "react-bootstrap";
import { Suggestion } from "../Common/Suggestion";
import * as vis from "vis"; 

interface NodeViewProps { Origin?:Suggestion, Suggestions?:Array<Suggestion>}
export class NodeView extends React.Component<NodeViewProps, any>
{
    componentDidMount()
    {
        this.drawNodes(this.props); 
    }

    componentWillReceiveProps(newprops:NodeViewProps)
    {
        this.drawNodes(newprops);
    }
    drawNodes(props:NodeViewProps) {        
        if(props.Suggestions == null || props.Suggestions.length <= 0)
            return; 
        
        var rootId = props.Origin.Id; 
        var nextSuggestions = new Array<Suggestion>();
        for(let v of props.Suggestions)
        {
            for(let i of v.InspiredBy)
            {
                if(i.Id === rootId)
                {
                    nextSuggestions.push(v); 
                    break; 
                }
            }
        }
       
        
        var nodes = new Array<any>(); 
        var edges = new Array<any>(); 
        var level = 0;
        for(let prevNode of props.Origin.InspiredBy)
        {            
            let opt = { id:prevNode.Id, group:0, label:prevNode.Title, level:level };
            let edge = { from:prevNode.Id, to:rootId, arrows:'to' }
            edges.push(edge); 
            nodes.push(opt);
          
        }
        // Root
        let opt = { id:rootId, group:0, label:props.Origin.Title, physics:false, color:{background:"lime"}, fixed:{x:true, y:true}, level:level  }; 
        level++;
        nodes.push(opt);     
        for(let nextNode of nextSuggestions)
        {            
            let opt = { id:nextNode.Id, group:0, label:nextNode.Title , color:{background:"yellow"}, level:level};
            let edge = { from:rootId, to:nextNode.Id, arrows:'to' }
            edges.push(edge); 
            nodes.push(opt);
            level++;
        }
    
         var data:any = { 
            nodes:nodes, 
            edges:edges
        };        

        var options = {                         
            nodes: { 
                shape:'dot', 
                size:10,
                font:{size:16},
                borderWidth:2, 
                shadow:true,
                widthConstraint:{ minimum:100, maximum:150}
            },
            edges:{
                width:2,
                shadow:true
            },
            layout:{              
                randomSeed:160
            }
        }

        var container = document.getElementById("vis");         
        
        var network = new vis.Network(container, data, options);         
        network.on('doubleClick', (params:any) => { 
            var nodeId = params.nodes[0]; 
            var s = props.Suggestions.filter( (k:Suggestion) => { return k.Id == nodeId}); 
            location.href = s[0].Url;
        });
    }
    render()
    {        
      
        return (
            <Col xs={12}>
                <div id="vis" style={{height:"400px"}}></div>
            </Col>
        )
    }
}