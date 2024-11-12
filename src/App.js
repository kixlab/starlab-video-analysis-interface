import React, {useEffect, useState} from 'react';

import './App.css';

import VideoPage from './pages/VideoPage';
import { SessionProvider } from './contexts/SessionContext';

function App() {
    const [approach, setApproach] = useState("approach_4");

    return (<SessionProvider approach={approach}>
		<div className='meta-page'>
			<VideoPage/>
		</div>
	</SessionProvider>);

}

export default App;