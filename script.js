let clientHtml = document.querySelector('html')
let canvas = document.querySelector('.canvas')
let canvasWrapper = document.querySelector('.canvas-wrapper')
let cavnasCursor = document.querySelector('.canvas-cursor')
let resizeHandles = document.querySelector('.border-div')
let canvasDimensions = canvas.getBoundingClientRect()
let elementSizeBadge = { width: document.querySelector('.element-size-wrapper .width-size'), height: document.querySelector('.element-size-wrapper .height-size') }
let toolbar = document.querySelector('.toolbar')
let tools = Array.from(toolbar.children)
let elements = []
let currentZIndex = 0


let state = {
    selectedElement: null,
    selectedTool: 'select',
    elementClicked: false,
    isSelection: false,
    isResizing: false,
    isDragging: false,
    resizeStart: {
        selectedHandle: '',
        startWidth: 0,
        startHeight: 0,
        startTop: 0,
        startLeft: 0,
        startMouseX: 0,
        startMouseY: 0,
    },
    dragOffset: { x: 0, y: 0 }
}

function saveElementData(element, type) {
    let elementData = {
        id: element.id,
        type: type,
        element: element,
        dimensions: {
            width: parseFloat(element.style.width),
            height: parseFloat(element.style.height),
        },
        position: {
            top: parseFloat(element.style.top),
            left: parseFloat(element.style.left),
        },
        elementArea: {
            fromY: parseFloat(element.style.top),
            fromX: parseFloat(element.style.left),
            toX: parseFloat(element.style.left) + parseFloat(element.style.width),
            toY: parseFloat(element.style.top) + parseFloat(element.style.height),
        },
        getData: function () {

            let computedStyle = window.getComputedStyle(element)
            console.log(computedStyle)
            return {
                id: element.id,
                type: type,
                position: {
                    top: parseFloat(computedStyle.top),
                    left: parseFloat(computedStyle.left),
                    bottom: parseFloat(computedStyle.bottom),
                    right: parseFloat(computedStyle.right)
                },
                dimensions: {
                    width: computedStyle.width,
                    height: computedStyle.height
                },
                style: {
                    backgroundColor: computedStyle.backgroundColor,
                    borderColor: computedStyle.borderColor,
                    borderWidth: computedStyle.borderWidth,
                    borderStyle: computedStyle.borderStyle,
                    opacity: computedStyle.opacity,
                    zIndex: computedStyle.zIndex,
                    transform: computedStyle.transform,
                    display: computedStyle.display,
                    position: computedStyle.position
                },
                classList: element.classList,
            }
        }
    }

    return elementData

}

function setCanvasAtCenter() {
    let wrapperHeight = canvasWrapper.clientHeight
    let wrapperWidth = canvasWrapper.clientWidth
    let canvasWidth = canvasWrapper.scrollWidth
    let canvasHeight = canvasWrapper.scrollHeight

    let canvasCenterX = (canvasWidth - wrapperHeight) / 2
    let canvasCenterY = (canvasHeight - wrapperWidth) / 2

    canvasWrapper.scrollLeft = canvasCenterX
    canvasWrapper.scrollTop = canvasCenterY
} setCanvasAtCenter()

function getCanvasRelativePosition(clientX, clientY) {
    const rect = canvas.getBoundingClientRect()
    return {
        x: clientX - rect.left,
        y: clientY - rect.top
    }
}
// //code to handle canvas cursor image
// function moveCanvasCursor(e) {
//     const x = e.clientX - canvasDimensions.left - 2
//     const y = e.clientY - canvasDimensions.top + 2
//     cavnasCursor.style.transform = `translate(${x}px, ${y}px)`
// }
// function canvasCursorEnter() {
//     cavnasCursor.style.display = 'block';
//     canvas.addEventListener('mousemove', moveCanvasCursor)
// }
// function canvasCursorLeave() {
//     cavnasCursor.style.display = 'none';
//     canvas.removeEventListener('mousemove', moveCanvasCursor)
// }
// canvas.addEventListener('mouseenter', canvasCursorEnter)
// canvas.addEventListener('mouseleave', canvasCursorLeave)


//-------------------------------------------------------------------------------------------------------
//Functions related to highlighting selected element in the canvas
//-------------------------------------------------------------------------------------------------------
function showSelectedElement(e) {
    if (state.selectedTool != 'select') return
    state.elementClicked = true
    state.isSelection = true
    e.stopPropagation();
    state.selectedElement = e.srcElement
    let selectedElementDetails = window.getComputedStyle(e.srcElement)
    positionResizeHandles(selectedElementDetails)
}
function deselectElement() {
    if (state.isSelection === false) return
    resizeHandles.style.display = 'none'
    resizeHandles.style.height = 0 + 'px'
    resizeHandles.style.width = 0 + 'px'
    resizeHandles.style.top = 0 + 'px'
    resizeHandles.style.left = 0 + 'px'
    state.elementClicked = false
}
function positionResizeHandles(elementDetails) {
    resizeHandles.style.display = 'block'
    resizeHandles.style.height = ((parseFloat(elementDetails.height)) + 1) + 'px'
    resizeHandles.style.width = (parseFloat(elementDetails.width) + 2) + 'px'
    resizeHandles.style.top = (parseFloat(elementDetails.top) - 1) + 'px'
    resizeHandles.style.left = (parseFloat(elementDetails.left) - 1) + 'px'
    //elementZindex was passsed as a string so we had to conver it in a number
    resizeHandles.style.zIndex = parseInt(elementDetails.zIndex) + 1

    //Size Badge Render
    elementSizeBadge.width.textContent = parseInt(elementDetails.width)
    elementSizeBadge.height.textContent = parseInt(elementDetails.height)
}

function dragElementStart(e) {
    if (state.isResizing == true) return
    console.log(e)
    console.log('isdrag')
}

function checkElementExist(clientX, clientY) {
    let ClickedCoords = getCanvasRelativePosition(clientX, clientY)

    let x = ClickedCoords.x
    let y = ClickedCoords.y

    elements.forEach(elem => {
        let areaExist = elem.elementArea
        if (areaExist.fromX <= x && x <= areaExist.toY || areaExist.formY <= y && y <= areaExist.toY) {
            return state.elementClicked = true
        } else {
            return state.elementClicked = false
        }
    })
}

function handleCanvasMouseEvents(e) {
    checkElementExist(e.clientX, e.clientY)
    if (state.elementClicked == false) {
        deselectElement(e)
    }
    else {
        canvas.addEventListener('mousedown',dragElementStart(e))
    }
}
canvas.addEventListener('click', handleCanvasMouseEvents)


//-------------------------------------------------------------------------------------------------------
//Function to handle resizing elements
//-------------------------------------------------------------------------------------------------------
document.querySelectorAll('.handle').forEach((side) => {
    side.addEventListener('mousedown', resizeStart)
})
function resizeStart(e) {
    if (state.isDragging == true) return
    state.isResizing = true
    e.stopPropagation();

    let elementStyle = window.getComputedStyle(state.selectedElement)
    state.resizeStart.startWidth = parseFloat(elementStyle.width)
    state.resizeStart.startHeight = parseFloat(elementStyle.height)
    state.resizeStart.startTop = parseFloat(elementStyle.top)
    state.resizeStart.startLeft = parseFloat(elementStyle.left)
    state.resizeStart.startMouseX = e.clientX
    state.resizeStart.startMouseY = e.clientY

    state.resizeStart.selectedHandle = e.target.classList.value.split(' ')[0]

    canvas.addEventListener('mousemove', handleResize)
    canvas.addEventListener('mouseup', resizeEnd)

}

function handleResize(e) {

    let deltaY = e.clientY - state.resizeStart.startMouseY
    let deltaX = e.clientX - state.resizeStart.startMouseX
    let element = state.selectedElement

    let newHeight = 0
    let newWidth = 0

    switch (state.resizeStart.selectedHandle) {
        case 'n':
            newHeight = state.resizeStart.startHeight - deltaY
            if (newHeight >= 0) {
                element.style.height = newHeight + 'px'
                element.style.top = (state.resizeStart.startTop + deltaY) + 'px'
            } else {
                element.style.height = Math.abs(newHeight) + 'px'
                element.style.top = (state.resizeStart.startTop + state.resizeStart.startHeight) + 'px'
            }
            break;

        case 's':
            newHeight = state.resizeStart.startHeight + deltaY
            if (newHeight >= 0) {
                element.style.height = newHeight + 'px'
            } else {
                element.style.height = Math.abs(newHeight) + 'px'
                element.style.top = (state.resizeStart.startTop - Math.abs(newHeight)) + 'px'
            }
            break;

        case 'e':
            newWidth = state.resizeStart.startWidth + deltaX
            if (newWidth >= 0) {
                element.style.width = newWidth + 'px'
            } else {
                element.style.width = Math.abs(newWidth) + 'px'
                element.style.left = (state.resizeStart.startLeft - Math.abs(newWidth)) + 'px'
            }
            break;

        case 'w':
            newWidth = state.resizeStart.startWidth - deltaX
            if (newWidth >= 0) {
                element.style.width = newWidth + 'px'
                element.style.left = (state.resizeStart.startLeft + deltaX) + 'px'
            } else {
                element.style.width = Math.abs(newWidth) + 'px'
                element.style.left = (state.resizeStart.startLeft + state.resizeStart.startWidth) + 'px'
            }
            break;
        case 'ne':
            newHeight = state.resizeStart.startHeight - deltaY
            newWidth = state.resizeStart.startWidth + deltaX
            if (newHeight >= 0) {
                element.style.height = newHeight + 'px'
                element.style.top = (state.resizeStart.startTop + deltaY) + 'px'
            } else {
                element.style.height = Math.abs(newHeight) + 'px'
                element.style.top = (state.resizeStart.startTop + state.resizeStart.startHeight) + 'px'
            }

            if (newWidth >= 0) {
                element.style.width = newWidth + 'px'
            } else {
                element.style.width = Math.abs(newWidth) + 'px'
                element.style.left = (state.resizeStart.startLeft - Math.abs(newWidth)) + 'px'
            }
            break;
        case 'nw':
            newHeight = state.resizeStart.startHeight - deltaY
            newWidth = state.resizeStart.startWidth - deltaX
            if (newHeight >= 0) {
                element.style.height = newHeight + 'px'
                element.style.top = (state.resizeStart.startTop + deltaY) + 'px'
            } else {
                element.style.height = Math.abs(newHeight) + 'px'
                element.style.top = (state.resizeStart.startTop + state.resizeStart.startHeight) + 'px'
            }

            if (newWidth >= 0) {
                element.style.width = newWidth + 'px'
                element.style.left = (state.resizeStart.startLeft + deltaX) + 'px'
            } else {
                element.style.width = Math.abs(newWidth) + 'px'
                element.style.left = (state.resizeStart.startLeft + state.resizeStart.startWidth) + 'px'
            }
            break;
        case 'se':
            newHeight = state.resizeStart.startHeight + deltaY
            newWidth = state.resizeStart.startWidth + deltaX
            if (newHeight >= 0) {
                element.style.height = newHeight + 'px'
            } else {
                element.style.height = Math.abs(newHeight) + 'px'
                element.style.top = (state.resizeStart.startTop - Math.abs(newHeight)) + 'px'
            }
            if (newWidth >= 0) {
                element.style.width = newWidth + 'px'
            } else {
                element.style.width = Math.abs(newWidth) + 'px'
                element.style.left = (state.resizeStart.startLeft - Math.abs(newWidth)) + 'px'
            }
            break;
        case 'sw':
            newHeight = state.resizeStart.startHeight + deltaY
            newWidth = state.resizeStart.startWidth - deltaX
            if (newHeight >= 0) {
                element.style.height = newHeight + 'px'
            } else {
                element.style.height = Math.abs(newHeight) + 'px'
                element.style.top = (state.resizeStart.startTop - Math.abs(newHeight)) + 'px'
            }
            if (newWidth >= 0) {
                element.style.width = newWidth + 'px'
                element.style.left = (state.resizeStart.startLeft + deltaX) + 'px'
            } else {
                element.style.width = Math.abs(newWidth) + 'px'
                element.style.left = (state.resizeStart.startLeft + state.resizeStart.startWidth) + 'px'
            }
            break;
    }

    let updatedRectDetails = window.getComputedStyle(element)
    positionResizeHandles(updatedRectDetails)
}

function resizeEnd() {
    canvas.removeEventListener('mousemove', handleResize)
    canvas.removeEventListener('mouseup', resizeEnd)
    state.isResizing = false;
}


//-------------------------------------------------------------------------------------------------------
//Function to create the rectangle
//-------------------------------------------------------------------------------------------------------
function createRectangle() {

    let StartingPointX = 0
    let StartingPointY = 0

    canvas.style.cursor = 'crosshair'
    function FinishRectangleCreation(e) {

        canvas.removeEventListener('mousemove', calculateRectSize)
        canvas.removeEventListener('mouseup', FinishRectangleCreation)
        canvas.style.cursor = 'default'
        if (state.isDragging && state.selectedElement) {
            state.selectedElement.classList.add('element')
            state.selectedElement.id = elements.length
            elements.push(saveElementData(state.selectedElement, 'rectangle'))
            state.selectedElement.addEventListener('click', showSelectedElement)
            state.isDragging = false
            state.selectedTool = 'select'

        }

    }

    function calculateRectSize(e) {
        let rectangle = state.selectedElement
        let currentPos = getCanvasRelativePosition(e.clientX, e.clientY)
        let currentMouseX = currentPos.x
        let currentMouseY = currentPos.y

        let deltaX = currentMouseX - StartingPointX
        let deltaY = currentMouseY - StartingPointY

        let newWidth = Math.abs(deltaX)
        let newHeight = Math.abs(deltaY)

        // In case user drags in reverse, we finalise the top-left positions before finalizing rectangles
        let finalLeft = deltaX < 0 ? currentMouseX : StartingPointX
        let finalTop = deltaY < 0 ? currentMouseY : StartingPointY

        rectangle.style.left = finalLeft + 'px'
        rectangle.style.top = finalTop + 'px'
        rectangle.style.width = newWidth + 'px'
        rectangle.style.height = newHeight + 'px'
    }


    function createRectByDragging(e) {
        let startPos = getCanvasRelativePosition(e.clientX, e.clientY)
        state.isDragging = true
        let newRect = document.createElement('div')
        StartingPointX = startPos.x
        StartingPointY = startPos.y
        newRect.style.position = 'absolute'
        newRect.style.background = 'red'
        newRect.style.top = StartingPointY + 'px'
        newRect.style.left = StartingPointX + 'px'
        newRect.style.width = '0px'
        newRect.style.height = '0px'
        newRect.style.zIndex = currentZIndex
        currentZIndex++
        state.selectedElement = newRect
        canvas.appendChild(state.selectedElement)
        canvas.addEventListener('mousemove', calculateRectSize)
        canvas.addEventListener('mouseup', FinishRectangleCreation)
        canvas.removeEventListener('mousedown', createRectByDragging)

    }
    canvas.addEventListener('mousedown', createRectByDragging)
}



//-------------------------------------------------------------------------------------------------------
//Function to handle toolbar events
//-------------------------------------------------------------------------------------------------------
function highlightSelectedTool(e) {
    tools.forEach(elem => {
        elem.classList.remove('active')
    })
    e.target.classList.add('active')
    state.selectedTool = e.target.dataset.toolname
}

function createElements(e) {
    highlightSelectedTool(e)
    let UsingTool = state.selectedTool
    switch (UsingTool) {
        case 'rectangle':
            createRectangle();
            break;
        // case 'select' : 
    }
}

tools.forEach(e => {
    e.addEventListener('click', createElements)
})













