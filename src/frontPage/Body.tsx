import React from "react";

function Body(props: { className: string; image: string; title: string; description: string; }) {
    return (
        <div className={props.className} >
            <div className="small-div">
                {/* <i className={props.className}></i> */}
                <img src={props.image} alt='' />
            </div>

            <div className="big-div">
                <span className='div-title'>
                    {props.title}
                </span>
                <br />
                <span>
                    <text className='div-text'>{props.description}</text>
                </span>
            </div>
        </div>
    );
}

export default Body;