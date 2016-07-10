import React, {Component} from 'react'

export class TopicList extends Component {

    handleEdit(fact){
        this.props.showModal({
            type: 'EDIT_FACT',
            props: {
                factId: fact.id
            }
        })
    }

    render() {
        const {topics} = this.props
        function createMarkup(html) { return {__html: html}; }
        return (
            <div>
                {topics.map(category=>
                    <div key={category.id}>
                        <h2>{category.title}</h2>
                        {category.facts.map(fact=>
                            <div key={fact.id}>
                                <p dangerouslySetInnerHTML={createMarkup(fact.html)}></p>
                                <div class="fact-edit-btns">
                                    <button className="btn-xs btn btn-danger" >&times;</button>
                                    <button className="btn-xs btn btn-primary" onClick={()=>this.handleEdit(fact)} >edit</button>
                                    <button className="btn-xs btn btn-primary">hide</button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        )}
}