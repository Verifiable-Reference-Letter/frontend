import React from "react";

function VideoBody(props: { className: string; video: string; title: string;}) {
    return (
        <div>
            <div className={props.className}>
                <i className={props.className}></i>
            </div>

            <div className="big-div">
                <span className='div-title-2'>
                    {props.title}
                </span>
                <br />
                <span>
                    <video width="800" height="600" controls>
                        <source src={props.video} type="video/mp4"/>
                        Your browser does not support the video tag.
                    </video>
                </span>
            </div>
        </div>
    );
}

export default VideoBody;